/* 订单确认页脚本 · 正式支付流程（前端只调用安全 API，状态由服务端控制） */
document.title = '订单确认 · ' + Istra.brand.cn;
Istra.reveal.observe(document);

const $ = (s) => document.querySelector(s);
function esc(v) {
  return String(v === undefined || v === null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
const yuan = (fen) => ('¥' + (fen / 100).toFixed(2));

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
      </div>
      <div class="pay__methods">
        <p class="pay__methods-title">支付方式</p>
        <div class="pay__method">
          <span class="pay__method-icon">微</span>
          <span class="pay__method-name">微信支付</span>
          <span class="pay__method-desc">${pay && pay.channel === 'test' ? '测试通道（模拟）' : '安全支付'}</span>
        </div>
      </div>
      <div class="pay__actions">
        <button class="btn btn--primary" type="button" id="btn-pay">立即支付 <span class="btn-arrow">→</span></button>
        <a class="btn btn--ghost-dark" href="profile.html#sec-orders">我的订单</a>
      </div>`;
    $('#btn-pay').addEventListener('click', onPay);
  };

  const onPay = async () => {
    const btn = $('#btn-pay');
    btn.disabled = true; btn.textContent = '创建订单中…';
    try {
      const o = await Istra.api.createOrder(product.id, 'test');
      order = o.order;
      const p = await Istra.api.createPayment(order.id);
      pay = p.pay;
      renderPaying();
    } catch (e) {
      card.innerHTML = '<div class="pay__error">' + esc(e.message || '创建订单失败') + '</div>';
    }
  };

  const renderPaying = () => {
    card.innerHTML = `
      <div class="pay__product">
        <span class="pay__product-badge">${product.id === 'ai-assessment' ? '✦' : '✈'}</span>
        <div><p class="pay__product-name">${esc(product.name)}</p><p class="pay__product-desc">${esc(product.desc)}</p></div>
      </div>
      <div class="pay__paying">
        <p class="pay__paying-title">订单已创建，请完成支付</p>
        <div class="pay__paying-row"><span>订单号</span><b>${esc(order.orderId)}</b></div>
        <div class="pay__paying-row"><span>应付金额</span><b>${yuan(order.amount)}</b></div>
        <div class="pay__paying-row"><span>支付方式</span><b>${pay.channel === 'wechat' ? '微信支付' : '测试支付通道'}</b></div>
        ${pay.channel === 'test' ? '<p class="pay__paying-mock">当前为测试支付通道（未接入真实商户号）：点击下方按钮模拟支付成功。支付成功与否由服务端回调验证，前端无法伪造支付状态。</p>' : ''}
      </div>
      <div class="pay__actions">
        ${pay.channel === 'test'
          ? '<button class="btn btn--primary" type="button" id="btn-mock-pay">模拟支付成功 <span class="btn-arrow">→</span></button>'
          : '<p class="pay__error">微信支付即将接入，请稍后重试或更换支付方式。</p>'}
        <button class="btn btn--ghost-dark" type="button" id="btn-cancel-order">取消订单</button>
      </div>`;
    const mock = $('#btn-mock-pay');
    if (mock) mock.addEventListener('click', onMockPay);
    $('#btn-cancel-order').addEventListener('click', onCancel);
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