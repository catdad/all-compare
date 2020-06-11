const path = require('path');

const toastifyPath = require.resolve('toastify-js');
const Toastify = require(toastifyPath);

const { css } = require('./ui.js');

css(path.resolve(toastifyPath, '../toastify.css'));

const colors = {
  green: 'linear-gradient(to right, #00b09b, #96c93d)',
  red: 'linear-gradient(to right, #b00000, #c93d7e)',
  yellow: 'linear-gradient(to right, #ffa35f, #ffc371)',
  blue: 'linear-gradient(to right, #5477f5, #73a5ff)'
};

const toast = (color) => {
  return (text, opts = {}) => {
    Toastify(Object.assign({
      text: text,
      gravity: 'top',
      position: 'right',
      backgroundColor: color,
      duration: 4000
    }, opts)).showToast();
  };
};

const api = {
  log: toast(colors.green),
  error: toast(colors.red),
  warn: toast(colors.yellow),
  info: toast(colors.blue)
};

module.exports = api;
