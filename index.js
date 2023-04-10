const puppeteer = require("puppeteer");
const fs = require("fs");

async function extractLinks(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const problems = [];

  for (let i = 1; i <= 14; i++) {
    const currentUrl = `${url}&page=${i}`;
    await page.goto(currentUrl, { waitUntil: "networkidle0", timeout: 120000 });

    const pageProblems = await page.$$eval("div[role='rowgroup'] > div[role='row']", (problemRows, pageNumber) =>
      problemRows.map((row) => {

        const problem =
          row.querySelector("div.truncate > a");
        const difficulty = row.querySelector('div[role="cell"] > span.text-yellow, span.text-olive, span.text-red, span.text-pink, span.text-green');
        const acceptance = row.querySelector('div[role="cell"] > span');
        const availability = row.querySelector('a.opacity-60') ? 'premium' : 'free';

        const problemNumber = parseInt(problem.textContent.trim())

        const problemData = {
          number: problemNumber,
          problem: problem.textContent.trim().split('. ')[1],
          url: problem.href,
          difficulty: difficulty.textContent.trim(),
          acceptance: parseFloat(acceptance.textContent.trim()),
          page: pageNumber,
          availability: availability,
        };
        return problemData;
      }),
      i
    );
    console.log(pageProblems)
    problems.push(...pageProblems);
  }

  await browser.close();
  return problems;
}

// Replace 'base_url_here' with the base URL without the page query parameter
const url =
  "https://leetcode.com/problemset/all/?difficulty=MEDIUM&sorting=W3sic29ydE9yZGVyIjoiQVNDRU5ESU5HIiwib3JkZXJCeSI6IkFDX1JBVEUifV0%3D";

extractLinks(url).then((problems) => {
  const jsonString = JSON.stringify(problems, null, 2);
  const jsonFileName = "problems-medium.json"
  fs.writeFileSync(jsonFileName, jsonString, "utf-8");
  console.log(`Data has been saved to ${jsonFileName}`);
});
