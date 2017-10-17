const osmosis = require("osmosis");
import * as https from "https";
import * as fs from "fs";
import {exec} from "child_process";
import * as R from "ramda";
import configuration from "./configuration";
import {asNumber} from "./helpers";

mangaPageDownload("https://mangafox.me/manga/berserk/c001", 1, resizeImages);

function mangaPageDownload(pageUrl: string, pageNumber: number, afterFinishCallback: Function): void {
    osmosis
    .get(`${pageUrl}/${pageNumber}.html`)
    .set({
        'image': '#image@src',
        'pageNumber': '#series > strong[2]'
    }).data((parsedData: any) => {
        if (pageNumber != asNumber(parsedData.pageNumber)) {
             afterFinishCallback(pageNumber - 1);
            return;
        } else {
            console.log(parsedData);
            processPageDownload(parsedData.image, `berserk_${asNumber(parsedData.pageNumber)}.jpg`);
            mangaPageDownload(pageUrl, pageNumber + 1, afterFinishCallback);
        }
    });

}

function processPageDownload(pageUrl: string, fileName: string): void {
    const file = fs.createWriteStream(`${configuration.mangasFolder}/${fileName}`);
    const request = https.get(pageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
      });
    });
  }

  function resizeImages(lastPage: number): void {
    const images = R.join(" ", R.times(n => `${configuration.mangasFolder}/berserk_${n + 1}.jpg`, lastPage));

    exec(`mogrify -resize ${configuration.pageSize} ${configuration.mangasFolder}/*.jpg`, () => {
        exec(`convert ${images} ${configuration.optionParams} ${configuration.mangasFolder}/berserk_01.pdf`, () => {
            console.log("Its done!");
        });
    });
  }