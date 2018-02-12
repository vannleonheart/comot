module.exports = function (provider, configs = {}) {
    let handler;

    if (typeof provider === 'string') {
        provider = provider.trim().toLowerCase();

        if (provider.length <= 0) {
            throw new Error('ERR_WRITE_HANDLER_NOT_SET');
        }

        handler = require(`./${provider}`)(configs);
    }

    return handler;
}
