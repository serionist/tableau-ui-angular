// An ES module: the published package is "type": "module", so Node would refuse CommonJS here.
import fs from 'fs';
import https from 'https';
import path from 'path';
import { pipeline } from 'stream/promises';

// The list of font files to download
const fontFiles = [
  'BentonSans-Book.woff',
  'BentonSans-Book.woff2',
  'BentonSans-Book_Italic.woff',
  'BentonSans-Book_Italic.woff2',
  'BentonSans-Medium.woff',
  'BentonSans-Medium.woff2',
  'BentonSans-SemiDemi.woff',
  'BentonSans-SemiDemi.woff2',
  'BentonSans-SemiDemi_Italic.woff',
  'BentonSans-SemiDemi_Italic.woff2',
  'BentonSans-Light.woff',
  'BentonSans-Light.woff2',
];

// Helper function to download a single file. The file is written only from a 200 answer, and a download that fails
// on the way leaves no part of it behind.
async function downloadFile(url, destination) {
  const response = await new Promise((resolve, reject) => {
    https.get(url, resolve).on('error', reject);
  });
  if (response.statusCode !== 200) {
    response.resume();
    throw new Error(`Failed to download file ${url}: ${response.statusCode}`);
  }
  try {
    // pipeline closes the file, and fails when the answer breaks off
    await pipeline(response, fs.createWriteStream(destination));
  } catch (error) {
    fs.rmSync(destination, { force: true });
    throw error;
  }
}

// Function to download all font files; it gives the names of those that failed
async function downloadFonts(serverUrl, downloadDir) {
  const failed = [];
  for (const fontFile of fontFiles) {
    const fileUrl = `${serverUrl}/img/${fontFile}`;
    const destination = path.join(downloadDir, fontFile); // Save file in the specified download folder
    console.log(`Downloading ${fontFile} from ${fileUrl}...`);
    try {
      await downloadFile(fileUrl, destination);
      console.log(`${fontFile} downloaded successfully.`);
    } catch (error) {
      console.error(`Error downloading ${fontFile}:`, error);
      failed.push(fontFile);
    }
  }
  return failed;
}

// Validate and parse CLI arguments
const args = process.argv.slice(2); // Get command-line arguments

if (args.length < 2) {
  console.error('Usage: node downloadFonts.js <server-url> <download-folder>');
  process.exit(1);
}

const serverUrl = args[0];
const downloadDir = args[1];

// Ensure the download directory exists, or create it
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Start downloading fonts; any that failed make the exit code 1, so a build that runs this stops
downloadFonts(serverUrl, downloadDir)
  .then(failed => {
    if (failed.length) {
      console.error(`${failed.length} of ${fontFiles.length} font files failed to download: ${failed.join(', ')}`);
      process.exitCode = 1;
    } else {
      console.log('All fonts downloaded successfully.');
    }
  })
  .catch(error => {
    console.error('Error downloading fonts:', error);
    process.exitCode = 1;
  });
