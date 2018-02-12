module.exports = function () {
    return {
        isReader: true,

        type: null,

        attributes: () => new Promise((resolve, reject) => {
            reject(new Error('ERR_ATTRIBUTES_FUNCTION_NOT_IMPLEMENTED'));
        }),
        
        toFile: () => new Promise((resolve, reject) => {
            reject(new Error('ERR_TO_FILE_FUNCTION_NOT_IMPLEMENTED'));
        }),
        
        toBuffer: () => new Promise((resolve, reject) => {
            reject(new Error('ERR_TO_BUFFER_FUNCTION_NOT_IMPLEMENTED'));
        }),

        toStream: () => new Promise((resolve, reject) => {
            reject(new Error('ERR_TO_STREAM_FUNCTION_NOT_IMPLEMENTED'));
        }),

        toString: () => new Promise((resolve, reject) => {
            reject(new Error('ERR_TO_STRING_FUNCTION_NOT_IMPLEMENTED'));
        })
    }
}