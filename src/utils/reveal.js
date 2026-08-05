/* 滚动入场工具 · IntersectionObserver
   用法：Istra.reveal.observe(root)，root 可为 Document 或 ShadowRoot
   内部所有带 [data-reveal] 的元素在进入视口时添加 .is-revealed */

Istra.reveal = (function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  function observe(root) {
    const nodes = (root || document).querySelectorAll('[data-reveal]');
    nodes.forEach((node) => {
      if (!node.classList.contains('is-revealed')) observer.observe(node);
    });
  }

  return { observe };
})();
