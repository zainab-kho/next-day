const { makeUniversalApp } = require('@electron/universal');
const path = require('path');

(async () => {
  await makeUniversalApp({
    x64AppPath: path.join(__dirname, 'out/Next Day-darwin-x64/Next Day.app'),
    arm64AppPath: path.join(__dirname, 'out/Next Day-darwin-arm64/Next Day.app'),
    outAppPath: path.join(__dirname, 'Next Day-universal/Next Day.app'),
  });

  console.log('✨ done! universal app created!');
})();