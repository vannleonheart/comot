const attributes = input => () => new Promise(resolve => {
    const availableAttributes = {
        size: input.length
    };

    resolve(availableAttributes);
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
        fs.writeFile(filepath, input, { encoding: 'base64' }).then(() => {
            resolve(filepath);
        }).catch(reject);
    }).catch(reject);
});

const toBuffer = input => () => new Promise(resolve => {
    const buff = Buffer.alloc(input.length, input, 'base64');

    resolve(buff);
});

const toStream = input => () => new Promise((resolve, reject) => {
    toBuffer(input)().then(buff => {
        const stream = require('stream');
        const duplexStream = new stream.Duplex();
    
        duplexStream.push(buff);
        duplexStream.push(null);
    
        resolve(duplexStream);    
    }).catch(reject);
});

const toString = input => () => new Promise(resolve => {
    resolve(input);
});

module.exports = (input, configs = {}) => {
    const Reader = require('./reader');
    const r = new Reader();
    
    r.type = 'string';
    r.attributes = attributes(input, configs);
    r.toFile = toFile(input, configs);
    r.toBuffer = toBuffer(input, configs);
    r.toStream = toStream(input, configs);
    r.toString = toString(input, configs);

    return r;
}
