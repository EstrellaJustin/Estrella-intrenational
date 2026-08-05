/* 图标库 · 抽象线稿 SVG（避免飞机 / 护照 / 廉价地球等具象符号）
   统一使用 currentColor，可随主题变色 */

Istra.icons = {
  /* 探索：抽象罗盘 */
  compass: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="24" cy="24" r="17"/>
      <path d="M24 7.5v4.2M24 36.3v4.2M7.5 24h4.2M36.3 24h4.2"/>
      <path d="M29.8 18.2 26.9 26.9 18.2 29.8 21.1 21.1Z"/>
      <circle cx="24" cy="24" r="1.5" fill="currentColor" stroke="none"/>
    </svg>`,

  /* 数据库：项目数据库 */
  database: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <ellipse cx="24" cy="15" rx="13" ry="6"/>
      <path d="M11 15v9c0 3.3 5.8 6 13 6s13-2.7 13-6v-9"/>
      <path d="M11 24v9c0 3.3 5.8 6 13 6s13-2.7 13-6v-9"/>
    </svg>`,

  /* AI：节点网络 */
  network: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <circle cx="36" cy="12" r="3"/>
      <circle cx="24" cy="36" r="3"/>
      <path d="M14.4 14.4 21.9 33.2M33.6 14.4 26.1 33.2"/>
      <path d="M15 12h18"/>
      <circle cx="24" cy="36" r="1" fill="currentColor" stroke="none"/>
    </svg>`,

  /* 方向箭头 */
  arrow: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6"/>
    </svg>`,

  /* 菜单 */
  menu: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
      <path d="M4 8h16M4 16h16"/>
    </svg>`,

  /* 关闭 */
  close: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18"/>
    </svg>`
};

Istra.icon = function (name) { return Istra.icons[name] || ''; };
