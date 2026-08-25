/* 个人中心脚本 */
document.title = '个人中心 · ' + Istra.brand.cn;
Istra.reveal.observe(document);

const $ = (s) => document.querySelector(s);

function esc(v) {
  return String(v === undefined || v === null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

(async function () {
  if (!Istra.auth.loggedIn()) {
    location.href = 'login.html?next=profile.html';
    return;
  }
  const user = await Istra.auth.init();
  if (!user) { location.href = 'login.html?next=profile.html'; return; }

  const unlocked = !!user.assessmentUnlock;
  let profile = {};
  let assessments = [];
  let recs = [];
  let behavior = { favorites: [], history: [], consults: [] };

  try {
    const me = await Istra.api.me();
    profile = me.profile || {};
  } catch (e) {}
  try { assessments = (await Istra.api.listAssessments()).assessments || []; } catch (e) {}
  try { behavior = await Istra.api.getBehavior(); } catch (e) {}
  if (assessments.length) {
    try { recs = (await Istra.api.getAssessment(assessments[0].id)).recommendations || []; } catch (e) {}
  }

  /* 侧栏 */
  $('#profile-card').innerHTML = `
    <div class="profile__avatar">${esc((user.name || '用').slice(0, 1))}</div>
    <p class="profile__name">${esc(user.name)}</p>
    <p class="profile__meta">${esc(user.phone || user.email || '')}</p>
    <p class="profile__meta">${esc(user.country || '')}${user.city ? ' · ' + esc(user.city) : ''}</p>
    <p class="profile__meta" style="margin-top:0.5rem">注册于 ${esc((user.registeredAt || '').slice(0, 10))}</p>
    <div class="profile__actions">
      <button class="btn btn--ghost-dark" type="button" id="btn-logout">退出登录</button>
    </div>`;
  $('#btn-logout').addEventListener('click', () => {
    Istra.auth.logout();
    location.href = 'index.html';
  });

  /* 我的资料 */
  const profLabels = {
    age: '年龄', gender: '性别', marital: '婚姻状态', hasKids: '是否有子女',
    occupation: '当前职业', degree: '教育程度', major: '专业', languages: '语言能力', skills: '技能'
  };
  const viewHtml = Object.keys(profLabels)
    .filter((k) => profile[k])
    .map((k) => `<div class="profile__row"><p class="profile__row-label">${profLabels[k]}</p><p class="profile__row-value">${esc(profile[k])}</p></div>`)
    .join('') +
    `<div class="profile__row"><p class="profile__row-label">姓名</p><p class="profile__row-value">${esc(user.name)}</p></div>` +
    `<div class="profile__row"><p class="profile__row-label">手机号 / 邮箱</p><p class="profile__row-value">${esc(user.phone || user.email)}</p></div>` +
    `<div class="profile__row"><p class="profile__row-label">所在地区</p><p class="profile__row-value">${esc(user.country || '')} ${esc(user.city || '')}</p></div>`;
  $('#profile-view').innerHTML = `<div class="profile__rows">${viewHtml}</div>`;

  const editHtml = `
    <div class="profile__form">
      <div class="field"><label>姓名</label><input id="pf-name" value="${esc(user.name)}" /></div>
      <div class="field"><label>所在国家</label><input id="pf-country" value="${esc(user.country)}" /></div>
      <div class="field"><label>所在城市</label><input id="pf-city" value="${esc(user.city)}" /></div>
      <div class="field"><label>年龄</label><input id="pf-age" value="${esc(profile.age)}" placeholder="如：30" /></div>
      <div class="field"><label>性别</label><select id="pf-gender"><option value="">未填写</option><option>男</option><option>女</option><option>其他</option></select></div>
      <div class="field"><label>婚姻状态</label><input id="pf-marital" value="${esc(profile.marital)}" placeholder="单身 / 已婚" /></div>
      <div class="field"><label>是否有子女</label><input id="pf-haskids" value="${esc(profile.hasKids)}" placeholder="有 / 无" /></div>
      <div class="field"><label>当前职业</label><input id="pf-occupation" value="${esc(profile.occupation)}" placeholder="如：焊工 / 程序员" /></div>
      <div class="field"><label>教育程度</label><input id="pf-degree" value="${esc(profile.degree)}" placeholder="如：大专" /></div>
      <div class="field"><label>专业</label><input id="pf-major" value="${esc(profile.major)}" /></div>
      <div class="field"><label>语言能力</label><input id="pf-languages" value="${esc(profile.languages)}" placeholder="如：英语基础 / 日语" /></div>
      <div class="field"><label>技能</label><input id="pf-skills" value="${esc(profile.skills)}" placeholder="如：机械维修" /></div>
    </div>`;
  $('#profile-edit').innerHTML = editHtml;
  if (profile.gender) $('#pf-gender').value = profile.gender;

  $('#btn-edit-profile').addEventListener('click', () => {
    $('#profile-view').style.display = 'none';
    $('#profile-edit').style.display = '';
    $('#btn-edit-profile').style.display = 'none';
    $('#btn-save-profile').style.display = '';
  });
  $('#btn-save-profile').addEventListener('click', async () => {
    try {
      await Istra.api.updateProfile({
        name: $('#pf-name').value.trim(), country: $('#pf-country').value.trim(), city: $('#pf-city').value.trim(),
        age: $('#pf-age').value.trim(), gender: $('#pf-gender').value, marital: $('#pf-marital').value.trim(),
        hasKids: $('#pf-haskids').value.trim(), occupation: $('#pf-occupation').value.trim(),
        degree: $('#pf-degree').value.trim(), major: $('#pf-major').value.trim(),
        languages: $('#pf-languages').value.trim(), skills: $('#pf-skills').value.trim()
      });
      location.reload();
    } catch (e) { alert(e.message); }
  });

  /* 我的AI评估 */
  $('#assess-list').innerHTML = assessments.length
    ? `<div class="profile__list">${assessments.map((a) => `
        <div class="profile__item">
          <div class="profile__item-main">
            <p class="profile__item-title">${esc(a.top ? a.top.country + ' · ' + a.top.project : '评估记录')}</p>
            <p class="profile__item-sub">${esc((a.savedAt || '').replace('T', ' ').slice(0, 16))} · ${a.recCount} 个推荐方案</p>
          </div>
          <span class="profile__item-cta" data-view-assess="${a.id}">查看详情 →</span>
        </div>`).join('')}</div>`
    : '<div class="profile__empty">暂无评估记录 · <a href="ai-assessment.html" style="color:var(--color-accent)">去评估</a></div>';
  document.querySelectorAll('[data-view-assess]').forEach((el) => {
    el.addEventListener('click', async () => {
      try {
        const d = await Istra.api.getAssessment(el.dataset.viewAssess);
        const shown = (d.recommendations || []).slice(0, unlocked ? 20 : 3);
        alert('评估 #' + d.assessment.id + '\n' + shown.map((r, i) => `${i + 1}. ${r.country} ${r.project}（${r.score} 分）`).join('\n') + (unlocked ? '' : '\n\n解锁后可查看全部 20 个方案') || '无推荐');
      } catch (e) { alert(e.message); }
    });
  });

  /* 我的推荐方案（免费 3 / 付费 20） */
  const visibleRecs = unlocked ? recs : recs.slice(0, 3);
  const recLockedBanner = (!unlocked && recs.length > 3)
    ? `<div class="unlock" style="margin-top:1rem">
        <p class="unlock__text">还有 ${recs.length - 3} 个方案已隐藏</p>
        <button class="btn btn--primary" type="button" id="btn-unlock-profile">¥9.9 解锁完整方案 <span class="btn-arrow">→</span></button>
      </div>`
    : '';
  $('#recs-list').innerHTML = (recs.length
    ? `<div class="profile__list"><div class="profile__item" style="flex-direction:column;align-items:stretch">
        ${visibleRecs.map((r) => `<div class="profile__rec"><span class="profile__rec-rank">${r.rank}</span><span class="profile__rec-name">${esc(r.country)} · ${esc(r.project)}</span><span class="profile__rec-score">${r.score} 分</span></div>`).join('')}
      </div></div>${recLockedBanner}`
    : '<div class="profile__empty">暂无推荐方案 · <a href="ai-assessment.html" style="color:var(--color-accent)">立即评估</a></div>');
  const unlockBtn = document.getElementById('btn-unlock-profile');
  if (unlockBtn) unlockBtn.addEventListener('click', () => { Istra.pay.openUnlockModal({ onDone: () => location.reload() }); });

  /* 我的收藏 */
  const favType = { favorite_project: '项目', favorite_city: '城市' };
  $('#fav-list').innerHTML = behavior.favorites.length
    ? `<div class="profile__list">${behavior.favorites.map((f) => `
        <div class="profile__item">
          <div class="profile__item-main">
            <p class="profile__item-title">${esc(f.title || f.refId)}</p>
            <p class="profile__item-sub">${favType[f.type] || f.type} · 收藏于 ${esc((f.createdAt || '').slice(0, 10))}</p>
          </div>
          ${f.type === 'favorite_project' ? `<a class="profile__item-cta" href="project-detail.html?id=${esc(f.refId)}">查看 →</a>` : `<a class="profile__item-cta" href="travel-city.html?id=${esc(f.refId)}">查看 →</a>`}
        </div>`).join('')}</div>`
    : '<div class="profile__empty">暂无收藏</div>';

  /* 浏览记录 */
  $('#history-list').innerHTML = behavior.history.length
    ? `<div class="profile__list">${behavior.history.slice(0, 20).map((h) => `
        <div class="profile__item">
          <div class="profile__item-main">
            <p class="profile__item-title">${esc(h.title || h.refId)}</p>
            <p class="profile__item-sub">${esc((h.createdAt || '').replace('T', ' ').slice(0, 16))}</p>
          </div>
        </div>`).join('')}</div>`
    : '<div class="profile__empty">暂无浏览记录（登录后浏览项目/国家/城市会自动记录）</div>';

  /* 咨询记录 */
  $('#consult-list').innerHTML = behavior.consults.length
    ? `<div class="profile__list">${behavior.consults.map((c) => `
        <div class="profile__item">
          <div class="profile__item-main">
            <p class="profile__item-title">${esc(c.title || '咨询')}</p>
            <p class="profile__item-sub">${esc((c.createdAt || '').replace('T', ' ').slice(0, 16))}</p>
          </div>
        </div>`).join('')}</div>`
    : '<div class="profile__empty">暂无咨询记录</div>';
})();

/* ================= 我的订单 / 我的权益（正式支付系统） ================= */
const statusMap = { pending: '待支付', paid: '已支付', cancelled: '已取消', refunded: '已退款', expired: '已过期' };
(function () {
  var ordersEl = document.querySelector('#orders-list');
  var entsEl = document.querySelector('#entitlements-list');
  if (!ordersEl && !entsEl) return;
  Promise.all([
    Istra.api.listOrders().catch(function () { return { orders: [] }; }),
    Istra.api.listEntitlements().catch(function () { return { entitlements: [] }; }),
    Istra.api.listProducts().catch(function () { return { products: [] }; })
  ]).then(function (res) {
    var orders = (res[0] && res[0].orders) || [];
    var ents = (res[1] && res[1].entitlements) || [];
    var products = (res[2] && res[2].products) || [];
    var yuan = function (fen) { return '¥' + (fen / 100).toFixed(2); };
    if (ordersEl) {
      ordersEl.innerHTML = orders.length ? '<div class="profile__rows">' + orders.map(function (x) {
        return '<div class="profile__row"><p class="profile__row-label">' + esc(x.productName) + '<br><small style="color:#64748B">' + esc(x.orderId) + '</small></p><p class="profile__row-value">' + yuan(x.amount) + ' · ' + (statusMap[x.status] || x.status) + (x.paidAt ? '<br><small style="color:#64748B">支付于 ' + esc((x.paidAt || '').slice(0, 10)) + '</small>' : '') + (x.channel === 'test' ? '<br><small style="color:#C9A227">测试通道</small>' : '') + '</p></div>';
      }).join('') + '</div><div style="margin-top:1rem"><a class="btn btn--ghost-dark" href="pay.html">去购买</a></div>'
        : '<div class="profile__empty">暂无订单。<a href="pay.html">立即购买 AI 深度评估 / DIY 签证深度方案</a></div>';
    }
    if (entsEl) {
      entsEl.innerHTML = ents.length ? '<div class="profile__rows">' + ents.map(function (x) {
        var prod = null;
        for (var i = 0; i < products.length; i++) { if (products[i].id === x.productId) { prod = products[i]; break; } }
        return '<div class="profile__row"><p class="profile__row-label">' + esc(prod ? prod.name : x.productId) + '</p><p class="profile__row-value">已解锁 · ' + esc((x.grantedAt || '').slice(0, 10)) + '</p></div>';
      }).join('') + '</div><div style="margin-top:1rem"><a class="btn btn--ghost-dark" href="pay.html">购买更多权益</a></div>'
        : '<div class="profile__empty">暂无已解锁权益。购买后权益将显示在这里。</div>';
    }
  });
})();