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
  let channel = 'alipay';
  let proofB64 = '';
  const card = $('#pay-card');

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
        <div class="pay__info-block"><p class="pay__info-title">购买须知</p><p class="pay__info-text">${esc(product.note)}</p></div>
        <div class="pay__info-block"><p class="pay__info-title">退款说明</p><p class="pay__info-text">${esc(product.refund)}</p></div>
        <div class="pay__info-block"><p class="pay__info-title">售后客服</p><p class="pay__info-text">售后客服 QQ：3279331550 · 服务时间 9:00 – 21:00</p></div>
      </div>
      <div class="pay__methods">
        <p class="pay__methods-title">选择支付方式</p>
        <label class="pay__method-option">
          <input type="radio" name="pay-channel" value="alipay" ${channel === 'alipay' ? 'checked' : ''} />
          <span class="pay__method-icon">支</span>
          <span class="pay__method-name">支付宝扫码</span>
          <span class="pay__method-desc">收款码 + 上传付款凭证 · 人工审核</span>
        </label>
        <label class="pay__method-option">
          <input type="radio" name="pay-channel" value="test" ${channel === 'test' ? 'checked' : ''} />
          <span class="pay__method-icon">微</span>
          <span class="pay__method-name">微信支付</span>
          <span class="pay__method-desc">测试通道（模拟支付）</span>
        </label>
      </div>
      <div class="pay__actions">
        <button class="btn btn--primary" type="button" id="btn-pay">立即支付 <span class="btn-arrow">→</span></button>
        <a class="btn btn--ghost-dark" href="profile.html#sec-orders">我的订单</a>
      </div>`;
    document.querySelectorAll('input[name="pay-channel"]').forEach((r) => {
      r.addEventListener('change', () => { channel = document.querySelector('input[name="pay-channel"]:checked').value; });
    });
    $('#btn-pay').addEventListener('click', onPay);
  };

  const onPay = async () => {
    const btn = $('#btn-pay');
    btn.disabled = true; btn.textContent = '创建订单中…';
    try {
      const o = await Istra.api.createOrder(product.id, channel);
      order = o.order;
      const p = await Istra.api.createPayment(order.id);
      pay = p.pay;
      renderPaying();
    } catch (e) {
      card.innerHTML = '<div class="pay__error">' + esc(e.message || '创建订单失败') + '</div>';
    }
  };

  const renderPaying = () => {
    if (pay.channel === 'alipay') return renderAlipay();
    card.innerHTML = `
      <div class="pay__product">
        <span class="pay__product-badge">${product.id === 'ai-assessment' ? '✦' : '✈'}</span>
        <div><p class="pay__product-name">${esc(product.name)}</p><p class="pay__product-desc">${esc(product.desc)}</p></div>
      </div>
      <div class="pay__paying">
        <p class="pay__paying-title">订单已创建，请完成支付</p>
        <div class="pay__paying-row"><span>订单号</span><b>${esc(order.orderId)}</b></div>
        <div class="pay__paying-row"><span>应付金额</span><b>${yuan(order.amount)}</b></div>
        <div class="pay__paying-row"><span>支付方式</span><b>测试支付通道</b></div>
        <p class="pay__paying-mock">当前为测试支付通道（未接入真实商户号）：点击下方按钮模拟支付成功。支付成功与否由服务端回调验证，前端无法伪造支付状态。</p>
      </div>
      <div class="pay__actions">
        <button class="btn btn--primary" type="button" id="btn-mock-pay">模拟支付成功 <span class="btn-arrow">→</span></button>
        <button class="btn btn--ghost-dark" type="button" id="btn-cancel-order">取消订单</button>
      </div>`;
    $('#btn-mock-pay').addEventListener('click', onMockPay);
    $('#btn-cancel-order').addEventListener('click', onCancel);
  };

  const renderAlipay = () => {
    card.innerHTML = `
      <div class="pay__product">
        <span class="pay__product-badge">${product.id === 'ai-assessment' ? '✦' : '✈'}</span>
        <div><p class="pay__product-name">${esc(product.name)}</p><p class="pay__product-desc">${esc(product.desc)}</p></div>
      </div>
      <div class="pay__alipay">
        <img class="pay__alipay-qr" src="assets/pay-alipay.jpg" alt="支付宝收款码" />
        <p class="pay__alipay-tip">打开支付宝扫码支付</p>
        <p class="pay__alipay-sub">请使用支付宝 App 扫描上方收款码，完成 ¥${(order.amount / 100).toFixed(2)} 付款</p>
        <div class="pay__paying-row"><span>支付宝订单号</span><b>${esc(order.orderId)}</b></div>
        <div class="pay__proof">
          <p class="pay__proof-title">上传付款凭证</p>
          <label class="pay__proof-file">
            <input id="proof-file" type="file" accept="image/*" hidden />
            <span class="pay__proof-btn">选择凭证图片</span>
            <span class="pay__proof-hint" id="proof-hint">付款成功后截图上传（转账记录/付款页）</span>
          </label>
          <img id="proof-preview" class="pay__proof-preview" alt="凭证预览" style="display:none" />
          <button class="btn btn--primary" type="button" id="btn-submit-proof" disabled>提交凭证，等待审核 <span class="btn-arrow">→</span></button>
          <p class="pay__proof-note">提交后订单进入「待审核」状态，审核通过后自动发放 AI 评估额度（10 次）。审核通常 1-2 个工作日内完成，如遇问题请联系售后客服 QQ：3279331550。</p>
        </div>
      </div>
      <div class="pay__actions">
        <button class="btn btn--ghost-dark" type="button" id="btn-cancel-order">取消订单</button>
      </div>`;
    $('#proof-file').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      try {
        proofB64 = (await compressProof(f, 1024, 0.85)).replace(/^data:[^;]+;base64,/, '');
        $('#proof-preview').src = 'data:image/jpeg;base64,' + proofB64;
        $('#proof-preview').style.display = '';
        $('#proof-hint').textContent = '已选择：' + f.name + '（约 ' + Math.round(proofB64.length * 0.75 / 1024) + ' KB）';
        $('#btn-submit-proof').disabled = false;
      } catch (err) { $('#proof-hint').textContent = err.message; }
    });
    $('#btn-submit-proof').addEventListener('click', onSubmitProof);
    $('#btn-cancel-order').addEventListener('click', onCancel);
  };

  const onSubmitProof = async () => {
    const btn = $('#btn-submit-proof');
    btn.disabled = true; btn.textContent = '提交中…';
    try {
      const r = await Istra.api.submitPaymentProof(order.id, proofB64);
      card.innerHTML = `
        <div class="pay__success">
          <p class="pay__success-icon">✓</p>
          <p class="pay__success-title">凭证已提交，订单待审核</p>
          <p class="pay__success-text">订单号 ${esc(order.orderId)} · 审核通过后将自动发放：${esc(product.name)}（AI 评估额度 10 次）</p>
          <a class="btn btn--primary" href="profile.html#sec-orders">查看我的订单</a>
        </div>`;
    } catch (e) {
      btn.disabled = false; btn.textContent = '提交凭证，等待审核';
      card.innerHTML += '<div class="pay__error">' + esc(e.message || '提交失败，请重试') + '</div>';
    }
  };

  const onMockPay = async () => {
    const btn = $('#btn-mock-pay');
    btn.disabled = true; btn.textContent = '支付验证中…';
    try {
      const r = await Istra.api.notifyPayment({
        orderId: order.orderId,
        transactionId: 'TEST-' + Date.now(),
        payToken: pay.payToken,
        amount: order.amount
      });
      if (r.alreadyPaid || r.ok) renderSuccess();
    } catch (e) {
      card.innerHTML = '<div class="pay__error">' + esc(e.message || '支付失败') + '</div>';
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

  const renderSuccess = () => {
    card.innerHTML = `
      <div class="pay__success">
        <p class="pay__success-icon">✓</p>
        <p class="pay__success-title">支付成功，权益已解锁</p>
        <p class="pay__success-text">订单号 ${esc(order.orderId)} · 已发放权益：${esc(product.name)}</p>
        <a class="btn btn--primary" href="profile.html#sec-orders">查看我的订单与权益</a>
      </div>`;
  };

  render();
})().catch((e) => { $('#pay-card').innerHTML = '<div class="pay__error">' + esc(e.message || '页面加载失败') + '</div>'; });
