const https = require('https');
const fs = require('fs');
const path = require('path');

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
  'BentonSans-Light.woff2'
];

// Helper function to download a single file
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        reject(new Error(`Failed to download file ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(destination, () => reject(err));
    });
  });
}

// Function to download all font files
async function downloadFonts(serverUrl, downloadDir) {
  for (const fontFile of fontFiles) {
    const fileUrl = `${serverUrl}/img/${fontFile}`;
    const destination = path.join(downloadDir, fontFile);  // Save file in the specified download folder
    console.log(`Downloading ${fontFile} from ${fileUrl}...`);
    try {
      await downloadFile(fileUrl, destination);
      console.log(`${fontFile} downloaded successfully.`);
    } catch (error) {
      console.error(`Error downloading ${fontFile}:`, error);
    }
  }
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

// Start downloading fonts
downloadFonts(serverUrl, downloadDir)
  .then(() => {
    console.log('All fonts downloaded successfully.');
  })
  .catch((error) => {
    console.error('Error downloading fonts:', error);
  });
