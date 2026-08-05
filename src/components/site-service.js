/* ============================================================
   组件：is-service · 服务咨询页
   咨询流程 / 服务范围 / 咨询表单（前端交互，无后端）
   ============================================================ */

class SiteService extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bind();
    Istra.reveal.observe(this);
  }

  render() {
    const steps = [
      { t: '提交需求', d: '填写咨询表单，说明个人背景与目标方向。' },
      { t: '顾问沟通', d: '专业顾问与您沟通，了解家庭、职业与资金情况。' },
      { t: '方案评估', d: '结合全球项目数据库，输出初步路线与建议。' },
      { t: '跟进落地', d: '明确后续步骤与材料清单，全程跟进推进。' }
    ];
    const scopes = ['个人与家庭身份规划', '工作与技术人才路径', '留学与教育规划', '投资与创业布局', '长期居留与身份转换'];

    this.innerHTML = `
      <div class="service">
        <header class="service__head">
          <div class="container">
            <p class="service__eyebrow" data-reveal>Consulting Service</p>
            <h1 class="service__title" data-reveal>服务咨询</h1>
            <p class="service__sub" data-reveal>基于全球项目数据库，为您提供一对一的国际发展路径咨询。</p>
          </div>
        </header>

        <div class="service__body">
          <div class="container service__grid">
            <div data-reveal>
              <h2 class="service__block-title">咨询流程</h2>
              <div class="service__steps">
                ${steps.map((s, i) => `
                  <div class="service__step">
                    <span class="service__step-num">0${i + 1}</span>
                    <div>
                      <p class="service__step-title">${s.t}</p>
                      <p class="service__step-desc">${s.d}</p>
                    </div>
                  </div>`).join('')}
              </div>

              <h2 class="service__block-title" style="margin-top:2.5rem">服务范围</h2>
              <div class="service__scope-list">
                ${scopes.map((s) => `<div class="service__scope">${s}</div>`).join('')}
              </div>
            </div>

            <div data-reveal>
              <form class="service__form" id="service-form">
                <p class="service__form-title">预约咨询</p>
                <p class="service__form-desc">填写以下信息，我们将尽快与您联系。</p>
                <div class="service__form-fields">
                  <div class="service__field">
                    <label for="sv-name">称呼</label>
                    <input id="sv-name" type="text" placeholder="您的称呼" autocomplete="off" required />
                  </div>
                  <div class="service__field">
                    <label for="sv-contact">联系方式</label>
                    <input id="sv-contact" type="text" placeholder="手机号 / 邮箱 / 微信" autocomplete="off" required />
                  </div>
                  <div class="service__field service__field--full">
                    <label for="sv-direction">意向方向</label>
                    <select id="sv-direction">
                      <option value="">请选择</option>
                      <option>工作与技术人才</option>
                      <option>留学与教育</option>
                      <option>投资与创业</option>
                      <option>长期身份规划</option>
                      <option>其他</option>
                    </select>
                  </div>
                  <div class="service__field service__field--full">
                    <label for="sv-msg">留言</label>
                    <textarea id="sv-msg" placeholder="简要说明您的背景与目标（选填）"></textarea>
                  </div>
                </div>
                <button class="btn btn--primary service__form-submit" type="submit">提交咨询 <span class="btn-arrow">→</span></button>
                <p class="service__form-success">✓ 已收到您的咨询信息，我们将尽快与您联系。</p>
              </form>

              <div class="service__contact">
                <div class="service__contact-item"><span class="tag">邮箱</span><span>${Istra.footer ? Istra.footer.contact.email : ''}</span></div>
                <div class="service__contact-item"><span class="tag">服务</span><span>服务全球 · 预约咨询</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bind() {
    this.querySelector('#service-form').addEventListener('submit', (e) => {
      e.preventDefault();
      e.target.classList.add('is-sent');
    });
  }
}

customElements.define('is-service', SiteService);
