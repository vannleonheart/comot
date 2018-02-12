const path = require('path');

const upload = (gcs, configs = {}) => (input, filename, options = {}) => new Promise((resolve, reject) => {
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
    
        let bucket;

        if (typeof options === 'string') {
            bucket = options.trim();
        } else {
            bucket = options.bucket || configs.bucket || '';
        }

        if (typeof bucket !== 'string' || bucket.length <= 0) {
            reject(new Error('ERR_BUCKET_NAME_REQUIRED'));
        }

        const mime = require('mime-types');
        
        const streamOptions = {
            metadata: {
                contentType: options.contentType || mime.contentType(path.extname(filename))
            },
            predefinedAcl: options.predefinedAcl || 'publicRead'
        }

        if (options.public === false || configs.public === false) {
            delete streamOptions.predefinedAcl;
        }

        input.toStream().then(rs => {
            const ws = gcs.bucket(bucket).file(filename).createWriteStream(streamOptions);

            ws.on('error', reject).on('finish', () => {
                resolve(`https://storage.googleapis.com/${bucket}/${filename}`);
            });

            rs.pipe(ws);
        }).catch(reject);
    } else {
        reject(new Error('ERR_MUST_BE_READER_INSTANCE'));
    }
});

module.exports = configs => {
    if (typeof configs === 'string') {
        configs = {
            keyFile: path.resolve(configs.trim())
        }
    }

    if (!configs || !configs.keyFile || typeof configs.keyFile !== 'string') {
        throw new Error('ERR_KEY_FILE_REQUIRED');
    }
    
    const GoogleCloudStorage = require('@google-cloud/storage');
    const gcs = new GoogleCloudStorage(configs);

    const Writer = require('./writer');
    const w = new Writer();

    w.provider = 'google-cloud-storage';
    w.upload = upload(gcs, configs);

    return w;
}