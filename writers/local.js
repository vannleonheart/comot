const upload = configs => (input, filename) => new Promise((resolve, reject) => {
    input = require('./../readers')(input, configs);

    if (input && input.isReader === true) {
        if (typeof filename !== 'string') {
            filename = '';
        } else {
            filename = filename.trim();
        }

        if (filename.length <= 0) {
            reject(new Error('ERR_FILE_NAME_REQUIRED'));            
        }
        
        input.toFile(filename).then(resolve).catch(reject); 
    } else {
        reject(new Error('ERR_MUST_BE_READER_INSTANCE'));
    }
});

const unlink = () => filename => new Promise((resolve, reject) => {
    if (typeof filename !== 'string') {
        filename = '';
    } else {
        filename = filename.trim();
    }

    if (filename.length <= 0) {
        reject(new Error('ERR_FILE_NAME_REQUIRED'));            
    }

    const fs = require('fs');
    const path = require('path');

    filename = path.resolve(filename);

    fs.unlink(filename, err => {
        if (err) {
            reject(err)
        } else {
            resolve();
        }
    });
});

module.exports = configs => {
    const Writer = require('./writer');
    const w = new Writer();

    w.provider = 'local';
    w.upload = upload(configs);
    w.unlink = unlink();

    return w;
}
