const optimize = require('../lib').default;

module.exports = {
  output: 'build',
  plugins: [
    optimize({})
  ]
};
