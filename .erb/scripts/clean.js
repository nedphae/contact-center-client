const rimraf = require('rimraf');
const process = require('process');
const path = require('path');

const dllPath = path.join(__dirname, '../dll');
const distPath = path.join('app/dist');
const releasePath = path.join('release');

const args = process.argv.slice(2);
const commandMap = {
  dist: distPath,
  dll: dllPath,
  release: releasePath,
};

args.forEach((x) => {
  const pathToRemove = commandMap[x];
  if (pathToRemove !== undefined) {
    rimraf.sync(pathToRemove);
  }
});
