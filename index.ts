import fs from 'fs';
import readline from 'readline';

function getInputFile() {
  const args = process.argv;
  let inputFile = args[2];
  if (!inputFile) {
    throw new Error('Input html file required as argument');
  }
  if (inputFile.split('.').pop() !== 'html') {
    throw new Error('Input file must be an html file');
  }

  return inputFile || '';
}

async function processHTML(inputFile: string) {
  const sectionRegex =
    /Section (\d{0,4}\.{0,1}\d{0,1}\.{0,1}\d{0,1}\.{0,1}\d{0,1})/;
  const titleRegex = /<span class="section_title">/;
  const fileStream = fs.createReadStream(inputFile);

  const readLines = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (let line of readLines) {
    // Dont want to add links to the title
    if (!titleRegex.test(line)) {
      const sectionMatch = line.match(sectionRegex);
      if (sectionMatch) {
        // remove any trailing spaces from the section number for the href link
        const formattedSection = sectionMatch[1].replace(/\.$/, '');
        line = line.replace(
          sectionRegex,
          `<a href="#${formattedSection}">Section ${sectionMatch[1]}</a>`
        );
      }
    }
    // console.log prints to stdout with a new line at the end
    // could also use process.stdout.write(line + '\n');
    console.log(line);
  }
}

try {
  const inputFile = getInputFile();
  processHTML(inputFile);
} catch (e) {
  console.error(e);
}
