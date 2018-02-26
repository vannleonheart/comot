const path = require('path');

const upload = (gcs, configs = {}) => (input, filename, options = {}) => new Promise((resolve, reject) => {
    input = require('./../readers')(input, configs);

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

const resolveResourceName = (filename, bucket) => {
    filename = filename.replace(/^https?\:\/\/storage\.googleapis\.com\//gi, '');
    filename = filename.replace(`${bucket}/`, '');

    return filename;
}

const unlink = (gcs, configs) => (filename, options = {}) => new Promise((resolve, reject) => {
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
    
    gcs.bucket(bucket).file(resolveResourceName(filename, bucket)).delete().then(resolve).catch(reject);
});

module.exports = configs => {
    if (typeof configs === 'string') {
        configs = {
            keyFilename: path.resolve(configs.trim())
        }
    }

    if (!configs || !configs.keyFilename || typeof configs.keyFilename !== 'string') {
        throw new Error('ERR_KEY_FILE_REQUIRED');
    }
    
    const GoogleCloudStorage = require('@google-cloud/storage');
    const gcs = new GoogleCloudStorage(configs);

    const Writer = require('./writer');
    const w = new Writer();

    w.provider = 'google-cloud-storage';
    w.upload = upload(gcs, configs);
    w.unlink = unlink(gcs, configs)

    return w;
}
