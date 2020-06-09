/* eslint-disable no-console */

const pixelmatch = require('pixelmatch');

const loadUrl = (img, url) => {
  return new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = e => reject(e);
    img.src = url;
  });
};

const loadImage = async (filepath) => {
  const img = new window.Image();
  await loadUrl(img, filepath);
  const { naturalWidth: width, naturalHeight: height } = img;

  return { img, width, height };
};

const readImageData = async (filepath) => {
  console.time(`draw ${filepath}`);
  const { img, width, height } = await loadImage(filepath);
  const { ctx } = getCanvas(width, height);

  ctx.drawImage(img, 0, 0, width, height);
  console.timeEnd(`draw ${filepath}`);

  console.time(`draw-data ${filepath}`);
  const data = ctx.getImageData(0, 0, width, height);
  console.timeEnd(`draw-data ${filepath}`);

  return data;
};

const getCanvas = (width, height) => {
  const canvas = new OffscreenCanvas(width, height);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  return { canvas, ctx };
};

const computeTolerance = async ({ leftData, rightData, threshold }) => {
  console.time('tolerance-compute');
  const { width, height } = leftData;

  console.time('diff-create');
  const output = new Uint8ClampedArray(width * height * 4);
  console.timeEnd('diff-create');

  console.time('diff');
  const pixels = pixelmatch(leftData.data, rightData.data, output, width, height, {
    threshold,
    diffMask: true
  });
  console.timeEnd('diff');

  console.timeEnd('tolerance-compute');
  return { leftData, rightData, pixels, output, width, height };
};

const tolerance = async ({ left, right, threshold = 0.05 }) => {
  console.time('tolerance');
  console.time('read');
  const [leftData, rightData] = await Promise.all([
    readImageData(left),
    readImageData(right)
  ]);
  console.timeEnd('read');

  const result = await computeTolerance({ leftData, rightData, threshold });

  console.timeEnd('tolerance');
  return result;
};

const info = async (imageFile) => {
  const { width, height } = await loadImage(imageFile);
  return { width, height };
};

module.exports = { info, tolerance, computeTolerance };
