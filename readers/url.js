const request = require('request');

const attributes = input => () => new Promise((resolve, reject) => {
    request.get(input, {}, (err, resp) => {
        if (err) {
            reject(err);
        } else {
            const headers = resp.headers;
            const availableAttributes = {
                size: headers['content-length'],
                type: headers['content-type']
            }

            resolve(availableAttributes);
        }
    });
});

const toFile = input => filepath => new Promise((resolve, reject) => {
    if (typeof filepath !== 'string') {
        filepath = '';
    } else {
        filepath = filepath.trim();
    }

    if (filepath.length <= 0) {
        return reject(new Error('ERR_DESTINATION_FILE_NOT_SET'));
    }

    const path = require('path');

    filepath = path.resolve(filepath);
    
    let filepathExt = path.extname(filepath).trim();

    if (filepathExt.length <= 0) {
        filepathExt = path.extname(input);

        filepath = filepath + filepathExt;
    }
    
    toStream(input)().then(data => {
        const fs = require('fs-extra');

        fs.ensureFile(filepath).then(() => {
            const ws = fs.createWriteStream(filepath);

            data.on('end', () => {
                resolve(filepath);
            });

            data.on('error', (err) => {
                reject(err);
            });

            data.pipe(ws);
       }).catch(reject);
    }).catch(reject);
});

const toBuffer = input => () => new Promise((resolve, reject) => {
    request.get(input, { encoding: null }, (err, resp, body) => {
        if (err) {
            reject(err);
        } else {
            resolve(body);
        }
    });
});

const toStream = input => () => new Promise(resolve => {
    resolve(request.get(input));
});

const toString = input => () => new Promise((resolve, reject) => {
    toBuffer(input)().then(data => {
        resolve(data.toString('base64'));
    }).catch(reject);    
});

module.exports = (input, configs = {}) => {
    const Reader = require('./reader');
    const r = new Reader();
    
    r.type = 'url';
    r.attributes = attributes(input, configs);
    r.toFile = toFile(input, configs);
    r.toBuffer = toBuffer(input, configs);
    r.toStream = toStream(input, configs);
    r.toString = toString(input, configs);

    return r;
}
