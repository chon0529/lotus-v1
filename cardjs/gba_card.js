import { cardInit } from './_card_core.js';

async function gbaCardInit() {
  const res = await fetch('./data/fetch_gba.json?_=' + Date.now());
  const newsList = await res.json();
  const wrap = document.getElementById('gba_card');
  if (!wrap) return;

  wrap.style.backgroundColor = '#B5495B';
  wrap.style.color = '#fff';

  if (!newsList.length) {
    wrap.innerHTML = '<div>無最新新聞</div>';
    return;
  }

  const ul = document.createElement('ul');
  ul.style.listStyle = 'none';
  ul.style.padding = 0;

  newsList.forEach(({ title, link, pubDate, source }, idx) => {
    const li = document.createElement('li');
    li.style.marginBottom = '6px';
    li.innerHTML = `<strong>[${source}]</strong> <a href="${link}" target="_blank" rel="noopener">${title}</a> <small>${pubDate.slice(5)}</small>`;
    ul.appendChild(li);
  });

  wrap.innerHTML = '';
  wrap.appendChild(ul);
}

cardInit(gbaCardInit, 'gba_card');