const path = require('path');
const distPath = `"${path.resolve(__dirname, '..', 'dist', 'component-library')}"`;

const modulePath = name =>  `"${path.resolve(__dirname, '..', 'node_modules', name)}"`;
console.log(`\n\n#### Library linking is now started
    
To consume this libray in your project, you need to:

1. Update the angular.json of your project, and add "preserveSymlinks": true in "projects.[your-app].architect.build.options.
   Also add projects.[your-app].architect.serve.options.prebundle.exclude = ["tableau-ui-angular"] to avoid prebundling the library.
   Your angular.json should look like:
    "projects": {
         "[your-app]": {
              "architect": {
                "build": {
                     "options": {
                          "preserveSymlinks": true
                     }
                },
                "serve": {
                     "options": {
                          "prebundle": {
                               "exclude": [
                                    "tableau-ui-angular"
                               ]
                          }
                     }
                }
              }
         }

2. Update the tsconfig.json of your project, and add "paths" in "compilerOptions":
   Your tsconfig.json should look like:
    "compilerOptions": {
        "paths": {
          "tableau-ui-angular": [
          "./node_modules/tableau-ui-angular"
          ]
     }
    }
3. Install npx link into the consuming project by running the following command:
    npm install --save-dev link

4. Run the following command in your consuming project root:
    npx link ${modulePath("@angular/common")} ${modulePath("@angular/core")} ${modulePath("@angular/forms")} ${modulePath("@angular/router")} ${modulePath("monaco-editor")} ${distPath}

### To Unlink the library once you've finished development (or commit the consuming project), run:
     npm install



### 

Press <Enter> once you've completed the above steps to continue`);

process.stdin.resume();
process.stdin.on('data', () => {
 
  process.exit(0); // Exit the process with a success code
});