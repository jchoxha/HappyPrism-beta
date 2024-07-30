require('dotenv').config();
const browserify = require('browserify');
const fs = require('fs');

browserify('src/index.js')
  .transform('babelify', {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: ['@babel/plugin-proposal-object-rest-spread']
  })
  .transform('envify')
  .bundle()
  .pipe(fs.createWriteStream('public/bundle.js'));