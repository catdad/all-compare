const path = require('path');
const is = require('./is.js');

const iconMap = {
  'win32-runtime': 'icons/icon.ico',
  'linux-runtime': 'icons/32x32.png',
  'linux-build': 'icons/256x256.png',
  'linux-glob': 'icons/*.png',
  'darwin-runtime': 'icons/icon.icns'
};

module.exports = (type = 'runtime') => {
  const iconName = iconMap[`${process.platform}-${type}`] || iconMap[`${process.platform}-runtime`];
  let icon = iconName ? path.resolve(__dirname, '..', iconName) : undefined;

  if (['build', 'glob'].includes(type)) {
    return icon;
  }

  if (icon && is.prod) {
    icon = icon.replace('app.asar', 'app.asar.unpacked');
  }

  if (process.platform === 'win32' && !is.prod) {
    return icon;
  }

  if (process.platform === 'linux') {
    return icon;
  }
};
