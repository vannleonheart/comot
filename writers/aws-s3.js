const upload = (s3, configs = {}) => (input, filename, options = {}) => new Promise((resolve, reject) => {
    if (typeof input === 'string') {
        const reader = require('./../readers'); 

        input = reader(input, configs);
    }

    if (input && input.isReader === true) {
        if (typeof filename !== 'string') {
            filename = '';
        } else {
            filename = filename.trim();
        }

        if (filename.length <= 0) {
            reject(new Error('ERR_FILE_NAME_REQUIRED'));            
        }
    
        let Bucket;

        if (typeof options === 'string') {
            Bucket = options.trim();
        } else {
            Bucket = options.bucket || configs.bucket || '';
        }

        if (typeof Bucket !== 'string' || Bucket.length <= 0) {
            reject(new Error('ERR_BUCKET_NAME_REQUIRED'));
        }

        input.toStream().then(rs => {
            const mime = require('mime-types');
            const path = require('path');

            const params = {
                Bucket,
                Key: filename,
                Body: rs,
                ACL:'public-read',
                ContentType: options.contentType || mime.contentType(path.extname(filename))
            }

            if (options.public === false || configs.public === false) {
                delete params.ACL;
            }
            
            s3.upload(params, (err, data) => {
                if (err) {
                    reject(err);
                } else{
                    resolve(data.Location);
                }
            });
        }).catch(reject);
    } else {
        reject(new Error('ERR_MUST_BE_READER_INSTANCE'));
    }
});

module.exports = configs => {
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3(Object.assign({}, configs, {
        apiVersion: '2006-03-01'
    }));

    const Writer = require('./writer');
    const w = new Writer();

    w.provider = 'aws-s3';
    w.upload = upload(s3, configs);

    return w;
}