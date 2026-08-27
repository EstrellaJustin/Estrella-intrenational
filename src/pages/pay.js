/* 订单确认页脚本 · 正式支付流程（前端只调用安全 API，状态由服务端控制） */
document.title = '订单确认 · ' + Istra.brand.cn;
Istra.reveal.observe(document);

const $ = (s) => document.querySelector(s);
function esc(v) {
  return String(v === undefined || v === null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
const yuan = (fen) => ('¥' + (fen / 100).toFixed(2));

/* 客户端压缩凭证图：最长边 1024 / JPEG 0.85，控制体积 */
function compressProof(file, maxSide, quality) {
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
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片读取失败')); };
    img.src = url;
  });
}

const CHANNELS = {
  alipay: { name: '支付宝支付', qr: 'assets/pay-alipay.jpg', tip: '请使用支付宝扫码支付', sub: '打开支付宝 App，扫描上方收款码完成付款' },
  wechat: { name: '微信支付', qr: 'assets/pay-wechat.png', tip: '请使用微信扫码支付', sub: '打开微信，扫描上方收款码完成付款' }
};

(async function () {
  if (!Istra.auth.loggedIn()) {
    location.href = 'login.html?next=' + encodeURIComponent(location.pathname + location.search);
    return;
  }
  await Istra.auth.init();
  const productId = new URLSearchParams(location.search).get('product') || '';
  let product = null;
  try {
    const data = await Istra.api.listProducts();
    product = data.products.find((p) => p.id === productId) || null;
  } catch (e) { product = null; }
  if (!product) {
    $('#pay-card').innerHTML = '<div class="pay__error">商品不存在或已下架。请返回首页选择商品。</div><div class="pay__actions"><a class="btn btn--ghost-dark" href="index.html">返回首页</a></div>';
    return;
  }

  let order = null;
  let pay = null;
  let proofB64 = '';
  const card = $('#pay-card');

  /* 第一屏：商品 + 选择支付方式（不显示二维码，不创建订单） */
  const render = () => {
    card.innerHTML = `
      <div class="pay__product">
        <span class="pay__product-badge">${product.id === 'ai-assessment' ? '✦' : '✈'}</span>
        <div>
          <p class="pay__product-name">${esc(product.name)}</p>
          <p class="pay__product-desc">${esc(product.desc)}</p>
        </div>
      </div>
      <div class="pay__price-row">
        <span class="pay__price-label">商品价格</span>
        <p class="pay__price"><small>${esc(product.currency)}</small>${yuan(product.price)}</p>
      </div>
      <div class="pay__info">
        <div class="pay__info-block"><p class="pay__info-title">购买内容</p><p class="pay__info-text">AI 评估 10 次额度 · 解锁完整 20 个国家/项目匹配结果</p></div>
        <div class="pay__info-block"><p class="pay__info-title">购买须知</p><p class="pay__info-text">${esc(product.note)}</p></div>
        <div class="pay__info-block"><p class="pay__info-title">售后客服</p><p class="pay__info-text">售后客服 QQ：3279331550 · 服务时间 9:00 – 21:00</p></div>
      </div>
      <div class="pay__methods">
        <p class="pay__methods-title">选择支付方式</p>
        <button class="pay__method-card" type="button" data-method="alipay">
          <span class="pay__method-icon">支</span>
          <span class="pay__method-name">支付宝</span>
          <span class="pay__method-desc">收款码 + 上传凭证 · 人工审核</span>
          <span class="pay__method-arrow">→</span>
        </button>
        <button class="pay__method-card" type="button" data-method="wechat">
          <span class="pay__method-icon">微</span>
          <span class="pay__method-name">微信支付</span>
          <span class="pay__method-desc">收款码 + 上传凭证 · 人工审核</span>
          <span class="pay__method-arrow">→</span>
        </button>
      </div>
      <p class="pay__note">付款申请提交后进入「待人工审核」，审核通过后自动发放 10 次 AI 评估额度并解锁完整 20 个国家/项目匹配结果。通常 1-2 个工作日内完成。</p>`;
    card.querySelectorAll('[data-method]').forEach((btn) => {
      btn.addEventListener('click', () => onChooseMethod(btn.getAttribute('data-method')));
    });
  };

  /* 选择支付方式 → 创建订单 → 显示对应二维码与提交表单 */
  const onChooseMethod = async (ch) => {
    card.innerHTML = '<div class="pay__loading">创建订单中…</div>';
    try {
      const o = await Istra.api.createOrder(product.id, ch);
      order = o.order;
      const p = await Istra.api.createPayment(order.id);
      pay = p.pay;
      renderMethod(ch);
    } catch (e) {
      card.innerHTML = '<div class="pay__error">' + esc(e.message || '创建订单失败') + '</div>';
    }
  };

  const renderMethod = (ch) => {
    const c = CHANNELS[ch] || CHANNELS.alipay;
    card.innerHTML = `
      <div class="pay__product">
        <span class="pay__product-badge">${product.id === 'ai-assessment' ? '✦' : '✈'}</span>
        <div><p class="pay__product-name">${esc(c.name)} · ${yuan(order.amount)}</p><p class="pay__product-desc">AI 评估 10 次 · 解锁完整 20 个国家/项目</p></div>
      </div>
      <div class="pay__method-body">
        <img class="pay__method-qr" src="${c.qr}" alt="${esc(c.name)}收款码" />
        <p class="pay__method-tip">${esc(c.tip)}</p>
        <p class="pay__method-sub">${esc(c.sub)}</p>
        <div class="pay__paying-row"><span>系统订单号</span><b>${esc(order.orderId)}</b></div>
        <div class="pay__field">
          <label for="tx-no">${esc(c.name === '支付宝支付' ? '支付宝' : '微信')}交易单号</label>
          <input id="tx-no" type="text" maxlength="80" placeholder="付款后填写 ${esc(c.name === '支付宝支付' ? '支付宝' : '微信')} 账单中的交易单号" autocomplete="off" />
        </div>
        <div class="pay__proof">
          <p class="pay__proof-title">上传付款凭证</p>
          <label class="pay__proof-file">
            <input id="proof-file" type="file" accept="image/*" hidden />
            <span class="pay__proof-btn">选择凭证图片</span>
            <span class="pay__proof-hint" id="proof-hint">付款成功后的账单截图 / 转账记录</span>
          </label>
          <img id="proof-preview" class="pay__proof-preview" alt="凭证预览" style="display:none" />
        </div>
        <button class="btn btn--primary" type="button" id="btn-submit-proof" disabled>提交付款申请 <span class="btn-arrow">→</span></button>
        <p class="pay__proof-note">提交后订单进入「待人工审核」。审核通过后将获得 10 次 AI 评估额度并解锁完整 20 个国家/项目匹配结果，不会在提交时立即生效。</p>
      </div>
      <div class="pay__actions">
        <button class="btn btn--ghost-dark" type="button" id="btn-back-method">← 返回支付方式</button>
        <button class="btn btn--ghost-dark" type="button" id="btn-cancel-order">取消订单</button>
      </div>`;
    const refreshSubmit = () => {
      const tx = $('#tx-no').value.trim();
      const img = $('#proof-preview');
      $('#btn-submit-proof').disabled = !(tx && img && img.style.display !== 'none');
    };
    $('#tx-no').addEventListener('input', refreshSubmit);
    $('#proof-file').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      try {
        proofB64 = (await compressProof(f, 1024, 0.85)).replace(/^data:[^;]+;base64,/, '');
        $('#proof-preview').src = 'data:image/jpeg;base64,' + proofB64;
        $('#proof-preview').style.display = '';
        $('#proof-hint').textContent = '已选择：' + f.name + '（约 ' + Math.round(proofB64.length * 0.75 / 1024) + ' KB）';
        refreshSubmit();
      } catch (err) { $('#proof-hint').textContent = err.message; }
    });
    $('#btn-submit-proof').addEventListener('click', onSubmitProof);
    $('#btn-back-method').addEventListener('click', async () => {
      if (order && order.status === 'pending') { try { await Istra.api.cancelOrder(order.id); } catch (e) {} }
      order = null; pay = null; proofB64 = '';
      render();
    });
    $('#btn-cancel-order').addEventListener('click', onCancel);
  };

  const onSubmitProof = async () => {
    const btn = $('#btn-submit-proof');
    const tx = $('#tx-no').value.trim();
    if (!tx) { alert('请填写交易单号'); return; }
    if (!proofB64) { alert('请上传付款凭证'); return; }
    btn.disabled = true; btn.textContent = '提交中…';
    try {
      await Istra.api.submitPaymentProof(order.id, proofB64, tx);
      card.innerHTML = `
        <div class="pay__success">
          <p class="pay__success-icon">📋</p>
          <p class="pay__success-title">付款申请已提交</p>
          <p class="pay__success-text">订单正在等待人工审核。<br />审核通过后将获得 10 次 AI 评估额度，并解锁完整 20 个国家/项目匹配结果。</p>
          <p class="pay__success-text">订单号 ${esc(order.orderId)} · 请保留付款凭证以便核对。</p>
          <a class="btn btn--primary" href="profile.html#sec-orders">查看我的订单</a>
        </div>`;
    } catch (e) {
      btn.disabled = false; btn.textContent = '提交付款申请';
      card.innerHTML += '<div class="pay__error">' + esc(e.message || '提交失败，请重试') + '</div>';
    }
  };

  const onCancel = async () => {
    try {
      await Istra.api.cancelOrder(order.id);
      card.innerHTML = '<div class="pay__success"><p class="pay__success-icon">✓</p><p class="pay__success-title">订单已取消</p><p class="pay__success-text">该订单已关闭，未产生任何扣款。</p><a class="btn btn--primary" href="profile.html#sec-orders">查看我的订单</a></div>';
    } catch (e) {
      card.innerHTML = '<div class="pay__error">' + esc(e.message || '取消失败') + '</div>';
    }
  };

  render();
})().catch((e) => { $('#pay-card').innerHTML = '<div class="pay__error">' + esc(e.message || '页面加载失败') + '</div>'; });
