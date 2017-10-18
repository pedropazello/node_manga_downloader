"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const osmosis = require("osmosis");
const https = require("https");
const fs = require("fs");
const child_process_1 = require("child_process");
const R = require("ramda");
const configuration_1 = require("./configuration");
const helpers_1 = require("./helpers");
// R.forEach((number) => downloadChapter("https://mangafox.me/manga/berserk", number)
// , R.times((n)=> { return n + 1  }, 351));
downloadChapter("https://mangafox.me/manga/berserk", 1);
function downloadChapter(mangaUrl, chapter) {
    return __awaiter(this, void 0, void 0, function* () {
        downloadMangaPages(`${mangaUrl}/c${helpers_1.ljust(String(chapter), 3, "0")}`, 1)
            .then(resizeImages)
            .then(() => console.log("Its done!"));
    });
}
function downloadMangaPages(pageUrl, pageNumber) {
    return new Promise((resolve, reject) => {
        osmosis
            .get(`${pageUrl}/${pageNumber}.html`)
            .set({
            'image': '#image@src',
            'pageNumber': '#series > strong[2]'
        }).data((parsedData) => {
            let currentPage;
            try {
                currentPage = helpers_1.asNumber(parsedData.pageNumber);
            }
            catch (exception) {
                setTimeout(() => {
                    downloadMangaPages(pageUrl, pageNumber);
                }, 500);
            }
            if (pageNumber != currentPage) {
                resolve(currentPage);
            }
            else {
                console.log(parsedData);
                processPageDownload(parsedData.image, `berserk_${helpers_1.asNumber(parsedData.pageNumber)}.jpg`);
                downloadMangaPages(pageUrl, pageNumber + 1);
            }
        });
    });
}
function processPageDownload(pageUrl, fileName) {
    const file = fs.createWriteStream(`${configuration_1.default.mangasFolder}/${fileName}`);
    const request = https.get(pageUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => file.close());
    });
}
function resizeImages(lastPage) {
    return new Promise((resolve, reject) => {
        const images = R.join(" ", R.times(n => `${configuration_1.default.mangasFolder}/berserk_${n + 1}.jpg`, lastPage));
        child_process_1.exec(`mogrify -resize ${configuration_1.default.pageSize} ${configuration_1.default.mangasFolder}/*.jpg`, () => {
            child_process_1.exec(`convert ${images} ${configuration_1.default.optionParams} ${configuration_1.default.mangasFolder}/berserk_01.pdf`, () => {
                resolve();
            });
        });
    });
}
//# sourceMappingURL=index.js.map