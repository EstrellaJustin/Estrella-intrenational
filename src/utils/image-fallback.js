/* 旅游图片加载失败全局回退：任何 <img> 失败后替换为默认占位图，禁止空白区域 */
(function () {
  var PLACEHOLDER = 'assets/images/travel/placeholder.svg';
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG') return;
    if (img.dataset.fallbackDone) return;
    img.dataset.fallbackDone = '1';
    img.src = PLACEHOLDER;
    img.alt = img.alt || '旅游图片暂不可用';
  }, true);
})();
