module.exports = function () {
    return {
        isWriter: true,

        provider: null,

        upload: () => new Promise((resolve, reject) => {
            reject(new Error('ERR_UPLOAD_FUNCTION_NOT_IMPLEMENTED'));
        })
    }
}