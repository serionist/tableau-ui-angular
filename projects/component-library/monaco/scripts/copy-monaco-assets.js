const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

const source = path.resolve(__dirname, 'node_modules/monaco-editor/min');
const target = path.resolve(__dirname, 'dist/component-library/assets/monaco');

fse.copySync(source, target);
console.log('✅ Monaco assets copied to:', target);
