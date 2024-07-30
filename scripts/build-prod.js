require('dotenv').config();
const browserify = require('browserify');
const fs = require('fs');
const uglify = require('uglify-js');

browserify('src/index.js')
  .transform('babelify', {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: ['@babel/plugin-proposal-object-rest-spread']
  })
  .transform('envify')
  .bundle((err, buf) => {
    if (err) throw err;
    const minified = uglify.minify(buf.toString());
    fs.writeFileSync('public/bundle.min.js', minified.code);
  });