import Excel = require('exceljs');
import NewsCrawler from './services/NewsCrawler';
import { JSDOM } from 'jsdom';
import { getWebsiteContent } from './util';
const main = async () => {
    const url = 'https://jtexpress.vn/vi/tracking?type=track&billcode=841189925424';
    const websiteHtml = await getWebsiteContent(url);


    if (!websiteHtml) {
        throw new Error('Empty website content');
    }
    const dom: JSDOM = new JSDOM(websiteHtml);
    const doc = dom.window.document;

    const resultVandonItems = doc.querySelectorAll('.result-vandon-item');
    let res = ''
    for (let i = 0; i < resultVandonItems.length - 1; i++) {
        //get firt div
        const firstDiv = resultVandonItems[i].querySelector('div');
        const firstDivSpans = firstDiv.querySelectorAll('span');
        const firstDivSpan1 = firstDivSpans[0];
        const firstDivSpan2 = firstDivSpans[1];
        const trackingItemTime = firstDivSpan1.textContent.trim();
        const trackingItemDate = firstDivSpan2.textContent.trim();
        //get second div
        const trackingItemContent = resultVandonItems[i].querySelectorAll('div')[3].textContent.trim()
        res += `${trackingItemDate} ${trackingItemTime}: ${trackingItemContent}\n`
        
        
    }

    console.log(res);




}

main().then()
