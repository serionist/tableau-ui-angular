console.log(`\n\n#### Library linking is now started
    
To consume this libray in your project, you need to:
1. Update the angular.json of your project, and add "preserveSymlinks": true in "projects.[your-app].architect.build.options.
   Your angular.json should look like:
    "projects": {
         "[your-app]": {
              "architect": {
                "build": {
                     "options": {
                          "preserveSymlinks": true
                     }
                }
              }
         }
2. Run the following command in your consuming project root:
    npm link tableau-ui-angular && cd node_modules/tableau-ui-angular && npm install --omit=peer --omit=dev --omit=optional && cd ../..


This will link the library to your project and you can start using it in your project.


### To Unlink the libbrary once you've finished development (or commit the consuming project), run:
     npm unlink --no-save tableau-ui-angular && npm install



Press <Enter> once you've completed the above steps to continue (only run "npm start" on the consuming project after you've pressed enter and change detection start)...`);

process.stdin.resume();
process.stdin.on('data', () => {
 
  process.exit(0); // Exit the process with a success code
});