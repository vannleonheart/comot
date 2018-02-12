const upload = (cloudinary, configs) => (input, filename) => new Promise((resolve, reject) => {
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
    
        input.toStream().then(stream => {
            const upstream = cloudinary.v2.uploader.upload_stream({
                public_id: filename,
                resource_type: 'auto',
                overwrite: true
            }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.secure_url);
                }
            });

            stream.pipe(upstream);
        }).catch(reject);
    } else {
        reject(new Error('ERR_MUST_BE_READER_INSTANCE'));
    }
});

module.exports = configs => {
    const cloudinary = require('cloudinary');
    cloudinary.config(configs);

    const Writer = require('./writer');
    const w = new Writer();

    w.provider = 'cloudinary';
    w.upload = upload(cloudinary, configs);

    return w;
}
