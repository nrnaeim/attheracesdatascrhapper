import puppeteer from "puppeteer";
import fs, { link } from "fs";

let baseUrl = "https://www.attheraces.com/results/02-February-2024";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();

  await page.goto(baseUrl);

  let clsCheck = await page.$$eval(
    `#fixtures-grouped-by-meeting > div`,
    (divs) => {
      return divs.map((div) => {
        return div.classList.contains("panel");
      });
    }
  );

  let allLinks = [];

  for (let i = 0; i < clsCheck.length; i++) {
    if (clsCheck[i] === true) {
      let resultName = await page.$eval(
        `#fixtures-grouped-by-meeting > div:nth-child(${i + 1})>a>h2`,
        (x) => x.textContent.trim()
      );

      let links = await page.$$eval("article>header>h2>a", (list) => {
        return list.map((link) => {
          return link.href.trim();
        });
      });

      for (let j = 0; j < links.length; j++) {
        let tempObj = {
          raceName: resultName,
          raceLink: links[j],
        };

        allLinks.push(tempObj);
        fs.writeFileSync("./raceLinks.json", JSON.stringify(allLinks));
      }
    }
  }

  await browser.close();
})();
