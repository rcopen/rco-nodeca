// Download morphology dictionaries from
// http://sphinxsearch.com/downloads/dicts/
//
'use strict';

/* eslint-disable no-console */

const fs   = require('fs');
const path = require('path');
const http = require('http');


let dict_path = path.resolve(__dirname, '..', 'sphinx_dicts/lemmatizer');


// Create directory if needed
dict_path
  .split(/\\|\//g)
  .reduce((p, base) => {
    p += base + path.sep;
    if (!fs.existsSync(p)){
      fs.mkdirSync(p);
    }
    return p;
  }, '');

function download(lang) {
  let filename = path.join(dict_path, lang + '.pak');
  let file_tmp = filename + '.partial';
  let file_url = `http://sphinxsearch.com/files/dicts/${lang}.pak`;

  return Promise.resolve().then(() => {
    let p = new Promise((resolve, reject) => {

      if (fs.existsSync(filename)) {
        resolve(false);
        return;
      }

      console.log(`Downloading lemmatizer dictionary: ${lang}.pak...`);

      let fileStream = fs.createWriteStream(file_tmp);

      let req = http.get(file_url, res => {
        if (res.statusCode !== 200) {
          reject(new Error(`Bad status code fo ${file_url}: ${res.statusCode}`));
          return;
        }

        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.end();
          resolve(true);
        });

        res.on('close', () => reject(new Error('download terminated')));
      });

      req.on('error', err => reject(err));

      fileStream.on('error', err => reject(err));
    });

    return p.then(downloaded => {
      if (downloaded) {
        fs.renameSync(file_tmp, filename);
      }
    })
    .catch(err => {
      try { fs.unlinkSync(filename); } catch (__) {}
      try { fs.unlinkSync(file_tmp); } catch (__) {}
      throw err;
    });
  });
}


Promise.all([ 'en', 'ru', 'de' ].map(lang => download(lang)))
  .catch(err => {
    console.log(err);
    throw err;
  });
