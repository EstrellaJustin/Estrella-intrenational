/* 页面入口脚本 */
const type = (document.querySelector('is-disclaimer') && document.querySelector('is-disclaimer').getAttribute('type')) || 'disclaimer';
const titles = { disclaimer: '免责声明', privacy: '隐私政策', terms: '用户协议' };
document.title = (titles[type] || '法律声明') + ' · ' + Istra.brand.cn;
Istra.reveal.observe(document);