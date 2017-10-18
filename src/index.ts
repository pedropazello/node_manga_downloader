const osmosis = require("osmosis");
import * as https from "https";
import * as fs from "fs";
import {exec} from "child_process";
import * as R from "ramda";
import configuration from "./configuration";
import {asNumber, ljust} from "./helpers";

downloadChapter("https://mangafox.me/manga/berserk", 1);

async function downloadChapter(mangaUrl: string, chapter: number) {
    downloadMangaPages(`${mangaUrl}/c${ljust(String(chapter), 3, "0")}`, 1)
    .then(resizeImages)
    .then(() => console.log("Its done!"));
}

function downloadMangaPages(pageUrl: string, pageNumber: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        osmosis
        .get(`${pageUrl}/${pageNumber}.html`)
        .set({
            'image': '#image@src',
            'pageNumber': '#series > strong[2]'
        }).data((parsedData: any) => {
            let currentPage;
            try {
                currentPage = asNumber(parsedData.pageNumber);
            } catch(exception) {
                setTimeout(() => {
                    downloadMangaPages(pageUrl, pageNumber);
                }, 500);
            }

            if (pageNumber != currentPage) {
                resolve(currentPage);
            } else {
                console.log(parsedData);
                processPageDownload(parsedData.image, `berserk_${asNumber(parsedData.pageNumber)}.jpg`);
                downloadMangaPages(pageUrl, pageNumber + 1);
            }
        });
    });
}

function processPageDownload(pageUrl: string, fileName: string): void {
    const file = fs.createWriteStream(`${configuration.mangasFolder}/${fileName}`);
    const request = https.get(pageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => file.close());
    });
}

function resizeImages(lastPage: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const images = R.join(" ", R.times(n => `${configuration.mangasFolder}/berserk_${n + 1}.jpg`, lastPage));
    
        exec(`mogrify -resize ${configuration.pageSize} ${configuration.mangasFolder}/*.jpg`, () => {
            exec(`convert ${images} ${configuration.optionParams} ${configuration.mangasFolder}/berserk_01.pdf`, () => {
                resolve();
            });
        });
    });
  }