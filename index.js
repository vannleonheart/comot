const Reader = input => {
    return require('./readers')(input);
}

const Writer = function (provider, configs) {
    return require('./writers')(provider, configs);
}

exports.Reader = Reader;
exports.Writer = Writer;

module.exports = {
    Reader,
    Writer
}
