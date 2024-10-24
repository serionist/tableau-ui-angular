const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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
  'BentonSans-SemiDemi_Italic.woff2'
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
async function downloadFonts(rootUrl) {
  for (const fontFile of fontFiles) {
    const fileUrl = `${rootUrl}/img/${fontFile}`;
    const destination = path.join(__dirname, fontFile);  // Save file to the same directory as the script
    console.log(`Downloading ${fontFile}...`);
    try {
      await downloadFile(fileUrl, destination);
      console.log(`${fontFile} downloaded successfully.`);
    } catch (error) {
      console.error(`Error downloading ${fontFile}:`, error);
    }
  }
}

// Create a prompt for the user to enter the root server URL
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please enter the root server URL (e.g., https://your-tableau-server): ', (rootUrl) => {
  downloadFonts(rootUrl)
    .then(() => {
      console.log('All fonts downloaded.');
      rl.close();
    })
    .catch((error) => {
      console.error('Error downloading fonts:', error);
      rl.close();
    });
});
