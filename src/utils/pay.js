/* ============================================================
   支付解锁弹窗（演示支付：仅修改解锁状态，不产生真实扣款）
   Istra.pay.openUnlockModal({ onDone })
   ============================================================ */
window.Istra = window.Istra || {};

Istra.pay = {
  openUnlockModal(opts) {
    const done = opts.onDone || function () {};
    if (document.getElementById('pay-modal')) return;
    const overlay = document.createElement('div');
    overlay.className = 'pay-overlay';
    overlay.id = 'pay-modal';
    overlay.innerHTML = `
      <div class="pay-modal">
        <button class="pay-modal__close" type="button" aria-label="关闭">×</button>
        <p class="pay-modal__eyebrow">Unlock Full Plan</p>
        <h3 class="pay-modal__title">解锁完整匹配方案</h3>
        <div class="pay-modal__order">
          <div class="pay-modal__row"><span>解锁内容</span><b>第 4–20 个隐藏项目（17 个方案）</b></div>
          <div class="pay-modal__row"><span>金额</span><b class="pay-modal__price">¥9.9</b></div>
          <div class="pay-modal__row"><span>解锁后</span><b>永久查看全部 20 个项目与推荐方案</b></div>
        </div>
        <button class="btn btn--primary pay-modal__pay" type="button">确认支付 ¥9.9 <span class="btn-arrow">→</span></button>
        <p class="pay-modal__note">* 演示环境：点击确认即视为支付成功，不产生真实扣款。支付仅解锁已有 AI 评估结果，不会重新生成评估。</p>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.pay-modal__close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    const btn = overlay.querySelector('.pay-modal__pay');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = '处理中…';
      try {
        const r = await Istra.api.unlock();
        overlay.remove();
        if (done) done(r);
      } catch (e) {
        btn.disabled = false;
        btn.textContent = '确认支付 ¥9.9 →';
        alert(e.message || '解锁失败，请稍后重试');
      }
    });
  }
};
