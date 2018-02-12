const fs = require('fs-extra');
const path = require('path');

const attributes = input => () => new Promise((resolve, reject) => {
    fs.lstat(input).then(stat => {
        const fp = path.parse(input);

        const availableAttributes = {
            size: stat.size,
            path: fp.dir,
            filename: fp.base,
            name: fp.name,
            extension: fp.ext
        };

        resolve(availableAttributes);
    }).catch(reject);
});

const toFile = input => (filepath = '') => new Promise((resolve, reject) => {
    if (typeof filepath !== 'string') {
        filepath = '';
    } else {
        filepath = filepath.trim();
    }

    if (filepath.length <= 0) {
        resolve(input);
    } else {
        filepath = path.resolve(filepath);

        fs.copy(input, filepath).then(() => {
            resolve(filepath);
        }).catch(reject);
    }
});

const toBuffer = input => () => new Promise((resolve, reject) => {
    fs.readFile(input, { encoding: null }, (err, data) => {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
});

const toStream = input => () => new Promise(resolve => {
    const rs = fs.createReadStream(input);

    resolve(rs);
});

const toString = input => () => new Promise((resolve, reject) => {
    toBuffer(input)().then(data => {
        resolve(data.toString('base64'));
    }).catch(reject);    
});

module.exports = (input, configs = {}) => {
    const Reader = require('./reader');
    const r = new Reader();

    input = path.resolve(input);

    r.type = 'file';
    r.attributes = attributes(input, configs);
    r.toFile = toFile(input, configs);
    r.toBuffer = toBuffer(input, configs);
    r.toStream = toStream(input, configs);
    r.toString = toString(input, configs);

    return r;
}
