import puppeteer from 'puppeteer';  // Make sure to install puppeteer

async function fetchGCSNews() {
    // Launch Puppeteer browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set the URL
    const url = 'https://www.gcs.gov.mo/list/zh-hant/news/%E5%9F%8E%E8%A6%8F%E5%9F%BA%E5%BB%BA?8';
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Extract data
    const newsData = await page.evaluate(() => {
        const newsItems = [];
        const newsElements = document.querySelectorAll('table#id2e9 .infiniteItem');
        
        newsElements.forEach(item => {
            const title = item.querySelector('.txt')?.textContent.trim() || '';
            const author = item.querySelector('.dept')?.textContent.trim() || '';
            const date = item.querySelector('.render_timeago_css')?.getAttribute('datetime') || '';
            const abstract = item.querySelector('.line2Truncate.baseSize')?.textContent.trim() || '';
            const link = item.querySelector('a')?.href || '';
            
            if (title && author && date && abstract && link) {
                newsItems.push({
                    title,
                    author,
                    date,
                    abstract,
                    link
                });
            }
        });

        return newsItems;
    });

    // Close the browser
    await browser.close();

    // Output the data
    console.log(newsData);

    // Optional: Save the data to a file
    const fs = require('fs');
    fs.writeFileSync('gcs_news.json', JSON.stringify(newsData, null, 2));

    return newsData;
}

fetchGCSNews().catch(error => console.error('Error fetching GCS news:', error));
