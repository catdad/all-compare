const { BrowserWindow } = require('electron');

const isomorphic = require('./isomorphic.js');
const name = 'progress';

let COUNT = 0;
let TOTAL = 0;

const init = (ticks) => {
  TOTAL += ticks;
};

const tick = () => {
  COUNT += 1;

  const progress = COUNT < TOTAL ? COUNT / TOTAL : -1;

  if (progress === -1) {
    TOTAL = COUNT = 0;
  }

  BrowserWindow.getAllWindows().filter(w => w.isVisible()).forEach(win => {
    win.setProgressBar(progress);
  });
};

const clear = () => {
  TOTAL = COUNT = 0;
  tick();
};

module.exports = isomorphic({
  name,
  implementation: { init, tick, clear }
});
