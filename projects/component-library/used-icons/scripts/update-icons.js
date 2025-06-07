const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ts = require('typescript');

// Generate Material Design URL based on the provided font options and icons
function generateMaterialDesignUrl({ font, weights, grades, opticalSizes, fills, icons }) {
    const baseUrl = 'https://fonts.googleapis.com/css2';

    // Helper function to format ranges
    const formatRange = (values) => {
        if (values.length === 1) {
            return values[0]; // Single value
        }
        return `${Math.min(...values)}..${Math.max(...values)}`; // Range format
    };

    // Prepare axes data
    const axes = [
        { key: 'FILL', values: fills.map((f) => (f ? 1 : 0)) },
        { key: 'GRAD', values: grades },
        { key: 'opsz', values: opticalSizes },
        { key: 'wght', values: weights },
    ];

    // Sort axes so lowercase comes before uppercase
    axes.sort((a, b) => {
        const aKey = a.key;
        const bKey = b.key;

        if (aKey.toLowerCase() === aKey && bKey.toLowerCase() !== bKey) {
            return -1; // a comes before b
        }
        if (bKey.toLowerCase() === bKey && aKey.toLowerCase() !== aKey) {
            return 1; // b comes before a
        }
        // Otherwise, sort by lowercase comparison
        return aKey.toLowerCase() < bKey.toLowerCase() ? -1 : 1;
    });

    // Build axes and values
    const axesKeys = axes.map(({ key }) => key).join(','); // e.g., opsz,FILL,wght,...
    const axesValues = axes.map(({ values }) => formatRange(values)).join(','); // e.g., 24,0..1,...

    // Build the URL
    const iconNames = icons.map((icon) => encodeURIComponent(icon)).join(',');
    const url = `${baseUrl}?family=${encodeURIComponent(font)}:${axesKeys}@${axesValues}&icon_names=${iconNames}&display=block`;

    return url;
}

// Download a file from a URL
async function downloadFile(url, outputPath) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
    });
    fs.writeFileSync(outputPath, response.data);
}

function loadTypeScriptFile(filePath) {
    // console.log(`Loading TypeScript file: ${filePath}`);
    const tsSource = fs.readFileSync(filePath, 'utf-8');

    // Get the directory of the file being loaded
    const fileDir = path.dirname(filePath);

    // Transpile the TypeScript file into JavaScript
    const transpiledJs = ts.transpileModule(tsSource, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
        },
    }).outputText;

    // Custom require to resolve paths relative to the file being loaded
    const requireRelative = (modulePath) => {
        let resolvedPath;
        // Handle absolute or relative paths
        if (modulePath.startsWith('.')) {
            // Resolve relative paths to the directory of the TypeScript file
            resolvedPath = path.resolve(fileDir, modulePath);
        } else {
            // Let Node resolve non-relative module paths
            resolvedPath = require.resolve(modulePath, { paths: [fileDir] });
        }

        // Add .ts extension if needed
        if (!fs.existsSync(resolvedPath) && fs.existsSync(`${resolvedPath}.ts`)) {
            resolvedPath = `${resolvedPath}.ts`;
        }

        // Ensure the file exists
        if (!fs.existsSync(resolvedPath)) {
            throw new Error(`Module not found: ${resolvedPath}`);
        }

        // Load and transpile the resolved TypeScript module
        return loadTypeScriptFile(resolvedPath);
    };

    // Execute the transpiled JavaScript code in a sandboxed environment
    const moduleExports = {};
    const script = new Function('exports', 'require', '__dirname', '__filename', transpiledJs);

    script(
        moduleExports,
        requireRelative, // Custom require for resolving relative imports
        fileDir,
        filePath,
    );

    // console.log('exports', moduleExports)
    return moduleExports;
}

// Main function to update icons
async function updateIcons(iconFilePath, outputFolder) {
    console.log('Reading icons...', iconFilePath);
    const { Icons } = loadTypeScriptFile(iconFilePath);

    // Ensure Icons is a valid class
    if (!Icons) {
        throw new Error(`Icons class not found in ${iconFilePath}`);
    }

    // Instantiate the Icons class
    const iconsInstance = new Icons();
    if (typeof iconsInstance.getAllIcons !== 'function') {
        throw new Error('Icons class must implement getAllIcons()');
    }

    const allIcons = iconsInstance.getAllIcons();
    const combinedCssContent = [];

    // Loop through all fonts and process them
    for (const font of iconsInstance.fonts) {
        const fontsConfig = {
            font,
            weights: iconsInstance.weights,
            grades: iconsInstance.grades,
            opticalSizes: iconsInstance.opticalSizes,
            fills: iconsInstance.fills,
            icons: allIcons,
        };

        console.log(`Processing font: ${font}`);
        const materialDesignUrl = generateMaterialDesignUrl(fontsConfig);
        //  console.log(`Generated Material Design URL for ${font}: ${materialDesignUrl}`);

        // Ensure output folder exists
        fs.mkdirSync(outputFolder, { recursive: true });

        const fontFileName = font.split(' ').join('-').toLowerCase();
        const cssPath = path.join(outputFolder, `${fontFileName}.css`);
        // console.log(`Downloading CSS for ${font} from: ${materialDesignUrl}`);
        await downloadFile(materialDesignUrl, cssPath);

        // Extract font URL from the CSS
        const cssContent = fs.readFileSync(cssPath, 'utf-8');
        const fontUrlMatch = cssContent.match(/url\((.*?)\)/);
        if (!fontUrlMatch) {
            throw new Error(`Font URL not found in the downloaded CSS for ${font}`);
        }

        fs.rmSync(cssPath);

        const fontUrl = fontUrlMatch[1];
        const fontPath = path.join(outputFolder, `${fontFileName}.woff2`);

        // console.log(`Downloading font for ${font} from: ${fontUrl}`);
        await downloadFile(fontUrl, fontPath);

        // Extract @font-face and update font URL
        const fontFaceMatch = cssContent.match(/@font-face {[^}]+}/g);
        if (fontFaceMatch) {
            const updatedFontFace = fontFaceMatch[0].replace(fontUrl, `${fontFileName}.woff2`);
            combinedCssContent.push(updatedFontFace);
        }
    }

    // Write combined CSS
    const combinedCssPath = path.join(outputFolder, 'material-icons.css');
    fs.writeFileSync(combinedCssPath, combinedCssContent.join('\n'));

    console.log(`\n
#### Success!
Make sure to import the generated CSS file in your project to use the updated icons.

#### Sample update in styles.scss:
@use '[path-to-output-folder]/material-icons.css';

`);
}

// CLI Arguments
const [, , iconFilePath, outputFolder] = process.argv;
if (!iconFilePath || !outputFolder) {
    console.error('Usage: node update-icons.js <iconFilePath> <outputFolder>');
    process.exit(1);
}

(async () => {
    try {
        await updateIcons(path.resolve(iconFilePath), path.resolve(outputFolder));
    } catch (error) {
        console.error('Error updating icons:', error);
        process.exit(1);
    }
})();
