// Download morphology dictionaries from
// http://sphinxsearch.com/downloads/dicts/
//

'use strict';

const Promise = require('bluebird');
const got     = require('got');
const fs      = require('mz/fs');
const path    = require('path');
const mkdirp  = Promise.promisify(require('mkdirp'));

let dict_path = path.resolve(__dirname, '..', 'sphinx_dicts/lemmatizer');


Promise.coroutine(function* () {
  yield mkdirp(dict_path);

  for (let lang of [ 'en', 'ru', 'de' ]) {
    let exists = true;
    let filename = path.join(dict_path, lang + '.pak');

    try {
      yield fs.stat(filename);
    } catch (err) {
      if (err.code === 'ENOENT') {
        exists = false;
      }
    }

    if (exists) continue;

    /* eslint-disable no-console */
    console.log(`Downloading lemmatizer dictionary: ${lang}.pak...`);

    try {
      yield new Promise((resolve, reject) => {
        let stream = got.stream(`http://sphinxsearch.com/files/dicts/${lang}.pak`, { retries: 1 });

        stream.pipe(fs.createWriteStream(filename + '.partial'));

        stream.on('error', err => reject(err));
        stream.on('end', () => resolve());
      });

      yield fs.rename(filename + '.partial', filename);
    } catch (err) {
      yield fs.unlink(filename + '.partial');
      throw err;
    }
  }
})().catch(err => {
  console.error(err.stack);
  process.exit(1);
});
