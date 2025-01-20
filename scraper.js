const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function cleanString(str) {
  str = str.replace(/[^a-zA-Z0-9\s]/g, ' ');
  return str.trim();
}

const scrapeLeetCodeProblem = async (url) => {
    if (!url) {
        console.error('No URL provided');
        return;
      }
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));
  await page.goto(url, { waitUntil: 'networkidle2' });
  try {
    await page.waitForSelector('.elfjS', { timeout: 10000 });
    const data = await page.evaluate(() => {
      const problemDescription = document.querySelector('.elfjS')?.innerText || 'No Content Found'; 
      const preTags = Array.from(document.querySelectorAll('pre'));
      const problemDetails = {
        input: [],
        output: []
      };
      let inputText = Array.from(document.querySelectorAll('.cm-line')).map((element) => element.innerText);
      let arguements=inputText.length/preTags.length;
      let input_count=0;
      preTags.forEach((preTag) => {
        const strongTags = preTag.querySelectorAll('strong');
        const outputText = strongTags[1]?.nextSibling?.textContent.trim() || '';
        const outputValue = outputText.split(':').pop()?.trim();
        if (outputValue) {
          problemDetails.output[input_count]= `${outputValue}`;
        }
        input_count++;
        problemDetails.input[input_count-1]='';
        for(let i=((input_count-1)*arguements);i<((input_count)*arguements);i++){
          problemDetails.input[input_count-1] += `${inputText[i]}\n`;
        } 
      });

      return { problemDescription, problemDetails,input_count, arguements };
    });

    const problemFolder = path.join(__dirname, 'LeetCodeProblem');
    if (fs.existsSync(problemFolder)) {
      fs.rmSync(problemFolder,{ recursive: true, force: true }, (err) => {
        if (err) {
          console.error('Error deleting folder:', err);
        } else {
          console.log('Folder deleted successfully');
        }
      });
    }
    fs.mkdirSync(problemFolder);

    fs.writeFileSync(path.join(problemFolder, 'problem_description.txt'), data.problemDescription);
    const problemDetails = data.problemDetails;

    for(let i=1;i<=data.input_count;i++){
      fs.writeFileSync(path.join(problemFolder, `input_${i}.txt`), cleanString(problemDetails.input[i-1]));
      fs.writeFileSync(path.join(problemFolder, `output_${i}.txt`), cleanString(problemDetails.output[i-1]));
    }

    console.log('Problem data saved successfully!');
    return data;
  } catch (error) {
    console.error('Error scraping problem:', error);
  } finally {
    await browser.close();
  }
};

// const url = process.argv[2];
// if (url) {
//   scrapeLeetCodeProblem(url).catch(console.error);
// } else {
//     console.log('Please provide a URL.');
// }

module.exports = { scrapeLeetCodeProblem };