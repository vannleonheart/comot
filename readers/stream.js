const attributes = input => () => new Promise((resolve, reject) => {
    toBuffer(input)().then(buff => {
        const availableAttributes = {
            size: buff.length
        }

        resolve(availableAttributes);
    }).catch(reject);
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
    const fs = require('fs-extra');

    filepath = path.resolve(filepath);

    fs.ensureFile(filepath).then(() => {
        const ws = fs.createWriteStream(filepath);

        ws.on('end', () => {
            resolve(filepath);
        });

        ws.on('error', reject);

        input.pipe(ws);
    }).catch(reject);
});

const toBuffer = input => () => new Promise(resolve => {
    const data = [];
    
    input.on('data', chunk => {
        data.push(chunk);
    });

    input.on('end', () => {
        resolve(Buffer.concat(data));
    });
});

const toStream = input => () => new Promise(resolve => {
    resolve(input);
});

const toString = input => () => new Promise((resolve, reject) => {
    toBuffer(input)().then(buff => {
        resolve(buff.toString('base64'));
    }).catch(reject);
});

module.exports = (input, configs = {}) => {
    const Reader = require('./reader');    
    const r = new Reader();
    
    r.type = 'stream';
    r.attributes = attributes(input, configs);
    r.toFile = toFile(input, configs);
    r.toBuffer = toBuffer(input, configs);
    r.toStream = toStream(input, configs);
    r.toString = toString(input, configs);

    return r;
}
