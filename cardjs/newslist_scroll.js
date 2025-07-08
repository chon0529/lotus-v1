// cardjs/newslist_scroll.js
document.querySelectorAll('.news-list').forEach(list => {
  let scrollTimeout;
  list.addEventListener('scroll', () => {
    list.classList.add('show-scroll');
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      list.classList.remove('show-scroll');
    }, 1200);
  });
  list.addEventListener('mouseenter', () => list.classList.add('show-scroll'));
  list.addEventListener('mouseleave', () => list.classList.remove('show-scroll'));
});