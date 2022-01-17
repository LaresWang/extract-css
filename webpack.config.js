const path = require('path');

module.exports = {
  entry: './core/index.js',
  output: {
    libraryTarget: 'umd',
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  target: "node"
};