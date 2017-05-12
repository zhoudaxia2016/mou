var path = require('path');

module.exports = {
  entry: './src/mou.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'mou.js'
  },
};
