const osmosis = require("osmosis");
import * as https from "https";
import * as fs from "fs";
import {exec} from "child_process";

mangaPageDownload("https://mangafox.me/manga/berserk/c001", 1, resizeImages);

function mangaPageDownload(pageUrl: string, pageNumber: number, afterFinishCallback: Function): void {
    osmosis
    .get(`${pageUrl}/${pageNumber}.html`)
    .set({
        'image': '#image@src',
        'pageNumber': '#series > strong[2]'
    }).data((parsedData: any) => {
        if (pageNumber != asNumber(parsedData.pageNumber)) {
            console.error(`end of page. Page founded: ${parsedData.pageNumber} page as number: ${asNumber(parsedData.pageNumber)} page passed as argument ${pageNumber}`);
            afterFinishCallback(pageNumber - 1);
            return;
        } else {
            console.log(parsedData);
            processPageDownload(parsedData.image, `berserk_${asNumber(parsedData.pageNumber)}.jpg`);
            mangaPageDownload(pageUrl, pageNumber + 1, afterFinishCallback);
        }
    });

}

function asNumber(pageNumber: string): number {
    return Number(pageNumber.replace(/\D/g, ""));
}

function processPageDownload(pageUrl: string, fileName: string): void {
    const file = fs.createWriteStream(`/opt/manga_download/${fileName}`);
    const request = https.get(pageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
      });
    });
  }

  function resizeImages(lastPage: number): void {
    const imageNames = new Array<string>();
    for(let i = 1; i <= lastPage; i++) {
        imageNames.push(`/opt/manga_download/berserk_${i}.jpg`);
    }

    exec(`mogrify -resize 600x800 /opt/manga_download/*.jpg`, () => {
        exec(`convert ${imageNames.join(" ")} -quality 100 /opt/manga_download/berserk_01.pdf`, () => {
            console.log("Its done!");
        });
    });
  }