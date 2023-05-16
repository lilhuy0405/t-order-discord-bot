import axios from "axios";
import { createWriteStream } from "fs";
import puppeteer from "puppeteer";

class FacebookVideoDownloaderService {
    private async _getDownloadUrl(fbVideoUrl: string) {
        let browser = null;

        try {
            browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox']
            });
            //by looking at the html, we can see that the url is after
            const hd_video_property = "playable_url_quality_hd";
            const page = await browser.newPage();
            await page.goto(fbVideoUrl, { waitUntil: 'domcontentloaded' });
            // Wait for 5 seconds
            const html = await page.content();
            // get url after playable_url_quality_hd
            let link = html.split(hd_video_property)[1].split(hd_video_property)[0].split("https")[1].split('"')[0];
            //add https
            link = "https" + link;
            const parsed = JSON.parse(`{"link": "${link}"}`);
            return parsed.link;
        } catch (error) {
            console.log(error);
            return null;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    private async _downloadFile(fileUrl: string, outputLocationPath: string) {
        const writer = createWriteStream(outputLocationPath);
        const response = await axios({
            method: 'get',
            url: fileUrl,
            responseType: 'stream',
        })

        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    resolve(true);
                }
                //no need to call the reject here, as it will have been called in the
                //'error' stream;
            });
        });
    }

    public async downloadVideo(fbVideoUrl: string, outputLocationPath: string) {
        const downloadUrl = await this._getDownloadUrl(fbVideoUrl);
        if (!downloadUrl) {
            return false;
        }
        const res = await this._downloadFile(downloadUrl, outputLocationPath);
        return res;
    }

    public async getVideoStream(fbVideoUrl: string) {
        const downloadUrl = await this._getDownloadUrl(fbVideoUrl);
        if (!downloadUrl) {
            return false;
        }
        const res = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream',
        })
        return res.data;
    }
}

export default FacebookVideoDownloaderService;