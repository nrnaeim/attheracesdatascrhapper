import puppeteer from "puppeteer";
import fs from "fs";
import {
  secTime,
  going,
  distance,
  headerRow,
  first3,
  dataCell,
} from "./selectors.js";

let links = fs.readFileSync("./raceLinks.json", "utf-8");
links = JSON.parse(links);

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();

  await page.setDefaultTimeout(0);
  //links.length
  for (let i = 0; i < 1; i++) {
    await page.goto(links[i].raceLink);
    await page.waitForNetworkIdle();
    await page.click(secTime);
    await page.waitForNetworkIdle();

    let Going = await page.$eval(going, (list) => {
      return list.textContent.trim();
    });

    let Distance = await page.$eval(distance, (list) => {
      return list.textContent.trim();
    });

    let Header = await page.$$eval(headerRow, (list) => {
      return list.map((x) => x.textContent.trim());
    });

    let First3 = await page.$$eval(first3, (list) => {
      return list.map((x) => x.textContent.split("\n").join(" ").trim());
    });

    let DataCell = await page.$$eval(dataCell, (list) => {
      return list.map((x) => x.textContent.trim());
    });

    let f = 0;
    let d = 0;
    let dataParam = Header.length - 3;

    let tempData = [];

    for (let index = 0; index < DataCell.length + First3.length; index++) {
      for (f; f < First3.length; f++) {
        tempData.push(First3[f]);
        if (f % 3 == 2) {
          f++;
          break;
        }
      }

      for (d; d < DataCell.length; d++) {
        tempData.push(DataCell[d]);
        if (d % dataParam === dataParam - 1) {
          d++;
          break;
        }
      }
    }
    let Data = [];
    let tempObj = {
      SourceURL: links[i].raceLink,
      Date: "2/2/2024",
      Going: Going,
      Course: links[i].raceName.split(" ")[0],
      Distance: Distance,
    };

    for (let j = 0; j < tempData.length; j++) {
      for (let k = 0; k < Header.length; k++) {
        if (j % Header.length === k) {
          tempObj[Header[k]] = tempData[j];
          if (k === Header.length - 1) {
            let Obj = Object.assign({}, tempObj);
            Data.push(Obj);
            console.log(Data);
            fs.writeFileSync("./raceData.json", JSON.stringify(Data));
            break;
          }
          break;
        }
      }
    }

    console.log(`Finished ${i + 1} of ${links.length}`);
  }

  console.log("Congratulations!, You have finished");
  await browser.close();
})();
