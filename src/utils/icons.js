/* 图标库 · 抽象线稿 SVG（避免飞机/护照/廉价地球等具象符号）
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
    </svg>`,

  /* 分类图标（抽象线稿 · 深蓝主题） */
  work: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="8" y="17" width="32" height="23" rx="2"/>
      <path d="M19 17v-3a4 4 0 0 1 8 0v3"/>
      <path d="M8 25h32"/>
    </svg>`,

  tech: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="14" y="14" width="20" height="20" rx="2"/>
      <rect x="18" y="18" width="12" height="12" rx="1"/>
      <path d="M19 14v-4M29 14v-4M19 38v-4M29 38v-4M14 19h-4M14 29h-4M38 19h-4M38 29h-4"/>
    </svg>`,

  edu: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M24 9 44 19 24 29 4 19Z"/>
      <path d="M12 24v9c0 2.4 5.4 5 12 5s12-2.6 12-5v-9"/>
      <path d="M44 19v7"/>
    </svg>`,

  invest: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M6 36 18 24l8 6 14-16"/>
      <path d="M32 14h8v8"/>
      <path d="M6 42h36"/>
    </svg>`,

  talent: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M24 8 C25 15, 33 17, 40 18 C33 19, 25 21, 24 28 C23 21, 15 19, 8 18 C15 17, 23 15, 24 8 Z"/>
    </svg>`,

  family: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="16" cy="17" r="5"/>
      <circle cx="32" cy="17" r="5"/>
      <path d="M7 37c0-5 4-8 9-8s9 3 9 8v2H7z"/>
      <path d="M31 31c4.5 0 8 3 8 7v1h-8"/>
    </svg>`,

  pr: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M24 7 38 12v11c0 9-6 15-14 18-8-3-14-9-14-18V12Z"/>
      <path d="M18 24l4 4 8-8"/>
    </svg>`,

  nomad: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="9" y="15" width="30" height="19" rx="2"/>
      <path d="M9 34h30"/>
      <path d="M6 39h36"/>
      <path d="M17 15v-3h14v3"/>
      <circle cx="24" cy="25" r="2.5"/>
    </svg>`,

  youth: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M24 10 C25 18, 30 23, 38 24 C30 25, 25 30, 24 38 C23 30, 18 25, 10 24 C18 23, 23 18, 24 10 Z"/>
      <path d="M40 10v8M36 14h8"/>
    </svg>`,

  special: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M24 8l7 9 9 7-9 7-7 9-7-9-9-7 9-7Z"/>
      <path d="M24 18v12M18 24h12"/>
    </svg>`
};

Istra.icon = function (name) { return Istra.icons[name] || ''; };
