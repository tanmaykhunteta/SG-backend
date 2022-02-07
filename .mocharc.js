'use strict';

module.exports = {
  spec: ['test/**/*.js'],
  timeout: '10000', 
  'trace-warnings': true,
  ui: 'bdd',
  'v8-stack-trace-limit': 100,
  watch: false,
  'watch-files': ['test/**/*.js'],
  'watch-ignore': ['lib/vendor']
};
