const upload = (cloudinary, configs) => (input, filename) => new Promise((resolve, reject) => {
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

const resolveResourceName = filename => {
    filename = filename.replace(/^https?\:\/\/res\.cloudinary\.com\/(\w+){1}\/image\/upload\/(\w+\/){1}/gi, '');
    
    const path = require('path');
    const fpath = path.parse(filename);
    
    return path.join(fpath.dir, fpath.name);
}

const unlink = cloudinary => filename => new Promise((resolve, reject) => {
    if (typeof filename !== 'string') {
        filename = '';
    } else {
        filename = filename.trim();
    }

    if (filename.length <= 0) {
        reject(new Error('ERR_FILE_NAME_REQUIRED'));            
    }

    cloudinary.v2.api.delete_resources(resolveResourceName(filename), err => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

module.exports = configs => {
    const cloudinary = require('cloudinary');
    cloudinary.config(configs);

    const Writer = require('./writer');
    const w = new Writer();

    w.provider = 'cloudinary';
    w.upload = upload(cloudinary, configs);
    w.unlink = unlink(cloudinary);

    return w;
}
