import Excel = require('exceljs');
import NewsCrawler from './services/NewsCrawler';
const main = async () => {
    const crawler = new NewsCrawler();
    const latestNews = await crawler.getLatestNews();
    console.log(latestNews);
    
}

main().then()
