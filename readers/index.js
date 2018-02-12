const getStringInputType = input => {
    input = input.trim();

    if (input.length <= 0) {
        throw new Error('ERR_INPUT_REQUIRED');
    }

    const urlRegex = new RegExp('^https?://', 'gi');
    
    if (urlRegex.test(input)) {
        return 'url';
    }

    const fs = require('fs-extra');
    
    if (fs.existsSync(input)) {
        const fstat = fs.lstatSync(input);

        if (fstat.isFile()) {
            return 'file';
        }

        throw new Error('ERR_IS_NOT_FILE');
    }

    return 'string';
}

const getObjectInputType = input => {
    if (typeof input === 'object') {
        if (input instanceof Buffer) {
            return 'buffer';
        }

        const stream = require('stream');

        if (input instanceof stream.Stream) {
            return 'stream';
        }
    }
}

const getInputType = input => {
    switch (typeof input) {
    case 'string':
        return getStringInputType(input);
    case 'object':
        return getObjectInputType(input);
    }

    return;
}

module.exports = (input, configs = {}) => {
    let handler;

    switch (getInputType(input)) {
    case 'url':
        handler = require('./url')(input, configs);
        break;
    case 'file':
        handler = require('./file')(input, configs);
        break;
    case 'buffer':
        handler = require('./buffer')(input, configs);
        break;
    case 'stream':
        handler = require('./stream')(input, configs);
        break;
    case 'string':
        handler = require('./string')(input, configs);
        break;
    default:
        throw new Error('ERR_READ_HANDLER_NOT_FOUND');
    }

    return handler;
}