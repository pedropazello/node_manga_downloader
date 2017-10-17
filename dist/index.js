"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const osmosis = require("osmosis");
const https = require("https");
const fs = require("fs");
const child_process_1 = require("child_process");
const R = require("ramda");
const configuration_1 = require("./configuration");
const helpers_1 = require("./helpers");
mangaPageDownload("https://mangafox.me/manga/berserk/c001", 1, resizeImages);
function mangaPageDownload(pageUrl, pageNumber, afterFinishCallback) {
    osmosis
        .get(`${pageUrl}/${pageNumber}.html`)
        .set({
        'image': '#image@src',
        'pageNumber': '#series > strong[2]'
    }).data((parsedData) => {
        if (pageNumber != helpers_1.asNumber(parsedData.pageNumber)) {
            afterFinishCallback(pageNumber - 1);
            return;
        }
        else {
            console.log(parsedData);
            processPageDownload(parsedData.image, `berserk_${helpers_1.asNumber(parsedData.pageNumber)}.jpg`);
            mangaPageDownload(pageUrl, pageNumber + 1, afterFinishCallback);
        }
    });
}
function processPageDownload(pageUrl, fileName) {
    const file = fs.createWriteStream(`${configuration_1.default.mangasFolder}/${fileName}`);
    const request = https.get(pageUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
        });
    });
}
function resizeImages(lastPage) {
    const images = R.join(" ", R.times(n => `${configuration_1.default.mangasFolder}/berserk_${n + 1}.jpg`, lastPage));
    child_process_1.exec(`mogrify -resize ${configuration_1.default.pageSize} ${configuration_1.default.mangasFolder}/*.jpg`, () => {
        child_process_1.exec(`convert ${images} ${configuration_1.default.optionParams} ${configuration_1.default.mangasFolder}/berserk_01.pdf`, () => {
            console.log("Its done!");
        });
    });
}
//# sourceMappingURL=index.js.map