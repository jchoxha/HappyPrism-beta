require('dotenv').config();
const watchify = require('watchify');
const browserify = require('browserify');
const fs = require('fs');

const b = browserify({
  entries: ['src/index.js'],
  cache: {},
  packageCache: {},
  plugin: [watchify]
})
  .transform('babelify', {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: ['@babel/plugin-proposal-object-rest-spread']
  })
  .transform('envify');

b.on('update', bundle);
bundle();

function bundle() {
  b.bundle()
    .pipe(fs.createWriteStream('public/bundle.js'));
}
