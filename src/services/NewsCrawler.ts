import {JSDOM} from 'jsdom';
import { getWebsiteContent } from '../util';
class NewsCrawler {

    public async getLatestNews() {
        try {
          const latestNewsUrl = "https://vnexpress.net/tin-tuc-24h"
    
          const websiteHtml = await getWebsiteContent(latestNewsUrl);
          if (!websiteHtml) {
            throw new Error('Empty website content');
          }
          const dom: JSDOM = new JSDOM(websiteHtml);
          const doc = dom.window.document;
          const links = doc.querySelectorAll("a");
          if (!links) {
            throw new Error('Empty links');
          }
          const listLinks = new Map<string, string>(); //href -> title
          for (let i = 0; i < links.length; i++) {
            const link = links[i];
            const href = link.getAttribute("href");
            if (!href) {
              continue;
            }
            if (!href.includes(".html")) {
              continue
            }
            const title = link.getAttribute("title");
            if (listLinks.has(href)) {
              continue;
            }
            listLinks.set(href, title);
          }
          //return top 10 latest news
          return Array.from(listLinks.entries()).slice(0, 10);
        } catch (err: any) {
          console.error(err);
          return null;
        }
      }

}

export default NewsCrawler;