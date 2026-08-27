/* 图片识别 / 视觉分析页面脚本 */
document.title = '图片识别 · ' + Istra.brand.cn;
Istra.reveal.observe(document);

const $ = (s) => document.querySelector(s);
function esc(v) {
  return String(v === undefined || v === null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* 客户端压缩：缩放 + JPEG，控制体积后再发送（原图不上传） */
function compressImage(file, maxSide, quality) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve({ dataUrl, width: w, height: h, sizeKB: Math.round(dataUrl.length * 0.75 / 1024) });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片读取失败，请更换图片')); };
    img.src = url;
  });
}

let current = null; /* { dataUrl, width, height, sizeKB } */

function renderResult(data) {
  const r = data.result || {};
  const items = Array.isArray(r.items) ? r.items : [];
  const box = $('#vision-result');
  box.innerHTML = `
    ${data.cached ? '<p class="vision__cached">⚡ 相同图片已分析过，本次直接使用缓存结果</p>' : ''}
    <div class="vision__card">
      <div class="vision__card-row"><span class="vision__card-label">图片类型</span><span class="vision__card-value">${esc(r.type || '图片')}</span></div>
      <div class="vision__card-row"><span class="vision__card-label">内容概括</span><span class="vision__card-value">${esc(r.summary || '—')}</span></div>
      <div class="vision__card-row"><span class="vision__card-label">提取文字</span><span class="vision__card-value vision__card-text">${esc(r.text || '—')}</span></div>
      <div class="vision__card-row"><span class="vision__card-label">关键信息</span>
        <span class="vision__card-value">${items.length ? '<ul class="vision__list">' + items.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul>' : '—'}</span>
      </div>
      <div class="vision__card-row"><span class="vision__card-label">结论 / 建议</span><span class="vision__card-value vision__card-text">${esc(r.conclusion || '—')}</span></div>
    </div>`;
}

function showError(msg) {
  const el = $('#vision-error');
  el.textContent = msg;
  el.style.display = '';
}

$('#file-input').addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    current = await compressImage(file, 1280, 0.85);
    const pv = await compressImage(file, 640, 0.7);
    $('#preview-img').src = pv.dataUrl;
    $('#preview-meta').textContent = current.width + '×' + current.height + ' · 约 ' + current.sizeKB + ' KB（已压缩）';
    $('#preview-box').style.display = '';
    $('#vision-error').style.display = 'none';
  } catch (err) { showError(err.message); }
});

/* 拖拽上传 */
const zone = $('#drop-zone');
['dragenter', 'dragover'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('is-drag'); }));
['dragleave', 'drop'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove('is-drag'); }));
zone.addEventListener('drop', (e) => {
  const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (file && file.type && file.type.startsWith('image/')) {
    const dt = new DataTransfer();
    dt.items.add(file);
    $('#file-input').files = dt.files;
    $('#file-input').dispatchEvent(new Event('change'));
  }
});

$('#btn-analyze').addEventListener('click', async () => {
  const errEl = $('#vision-error');
  errEl.style.display = 'none';
  if (!current) { showError('请先选择一张图片'); return; }
  const btn = $('#btn-analyze');
  btn.disabled = true; btn.textContent = '分析中…';
  const focus = $('#focus-input').value.trim();
  try {
    const imageB64 = current.dataUrl.replace(/^data:[^;]+;base64,/, '');
    const data = await Istra.api.analyzeVision({ image: imageB64, mime: 'image/jpeg', focus });
    renderResult(data);
  } catch (e) {
    showError(e.message || '分析失败，请稍后重试');
  } finally {
    btn.disabled = false; btn.textContent = '开始分析';
  }
});
