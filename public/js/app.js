console.log('Nova-Lotus app.js loaded');

const app=document.querySelector('#app');
if(app){
  app.innerHTML=`
    <div class="statusbar">
      <div class="tile"><b>36</b><span>所有來源</span></div>
      <div class="tile"><b>128</b><span>今日新增</span></div>
      <div class="tile"><b>15</b><span>15分鐘內</span></div>
      <div class="tile"><b>33</b><span>正常來源</span></div>
    </div>
    <div class="grid">
      <section class="card a">
        <h2>A. 政府政策</h2>
        <div class="item">1. [A1] GCS 發布政府最新新聞<div class="meta">GCS · 10 分鐘前</div></div>
        <div class="item">2. [A4] CEPA 搜尋結果更新<div class="meta">gov.mo · 22 分鐘前</div></div>
      </section>
      <section class="card b">
        <h2>B. AS Roma</h2>
        <div class="item">1. [B3] Roma 官方發布最新訓練消息<div class="meta">AS Roma Official · 18 分鐘前</div></div>
        <div class="item">2. [B2] LaRoma24 更新球隊新聞<div class="meta">LaRoma24 · 42 分鐘前</div></div>
      </section>
      <section class="card c">
        <h2>C. 財經市場</h2>
        <div class="item">1. [C1] NOK / NVDA Watchlist 準備中<div class="meta">Watchlist · 5 分鐘前</div></div>
        <div class="item">2. [C3] AI 與半導體新聞聚合準備中<div class="meta">C3 · 28 分鐘前</div></div>
      </section>
    </div>
  `;
}
