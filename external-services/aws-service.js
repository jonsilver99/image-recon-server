const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const stream = require('stream');
let existingPics = require('../data/picnames');

let envConfig = (() => {
    if (fs.existsSync('env/dev_vars.js')) {
        return require('../env/dev_vars');
    } else if (fs.existsSync('env/prod_vars.js')) {
        return require('../env/prod_vars');
    } else {
        return null;
    }
})();

const BucketName = envConfig.BucketName;
AWS.config.region = envConfig.S3_REGION;
AWS.config.accessKeyId = envConfig.AWS_ACCESS_KEY_ID;
AWS.config.secretAccessKey = envConfig.AWS_SECRET_ACCESS_KEY;

module.exports = class awsHandler {

    static uploadFileToS3Bucket(file) {
        if (!file) {
            return Promise.resolve('no file given')
        }
        // Append filename with a unique suffix
        let s3filename = this.addRandomSuffix(file.name);
        // Buffer the file data then upload it to S3
        let fileData = new Buffer(file.data);
        return new Promise((resolve, reject) => {
            const s3 = new AWS.S3({ params: { Bucket: BucketName } });
            let uploadParams = { Bucket: BucketName, Key: s3filename, Body: fileData };
            s3.upload(uploadParams, (err, data) => {
                if (err) {
                    reject(err);

                } else {
                    resolve(data);
                }
            })
        })
    }

    static addRandomSuffix(filename) {
        // save file extension
        let extension = path.extname(filename);
        // strip filename extension
        let s3filename = filename.slice(0, filename.indexOf('.'))

        let suffixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 5; i++) {
            s3filename += suffixChars.charAt(Math.floor(Math.random() * suffixChars.length));
        }
        s3filename += extension;
        return s3filename;
    }

    // get all uploaded images's names
    static getAllPictures() {
        return Promise.all(existingPics.map((picName) => {
            return this.fetchSignedPicture(picName);
        }))
            .then((allPictures) => {
                return allPictures
            })
            .catch(err => {
                throw err;
            })
    }

    static fetchSignedPicture(fileName) {
        const s3 = new AWS.S3({ params: { Bucket: BucketName } });
        let requestParams = { Bucket: BucketName, Key: fileName, Expires: 86400 };
        // Signed picture format:
        let pictureData = { name: fileName, signedURL: null }

        return new Promise((resolve, reject) => {
            s3.getSignedUrl('getObject', requestParams, (err, url) => {
                if (err) {
                    reject(err);
                } else {
                    pictureData.signedURL = url
                    resolve(pictureData);
                }
            })
        })
    }

    static downloadPictureObject(fileName) {
        const s3 = new AWS.S3({ params: { Bucket: BucketName } });
        let requestParams = { Bucket: BucketName, Key: fileName };

        return new Promise((resolve, reject) => {
            s3.getObject(requestParams, (err, pictureObject) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(pictureObject);
                }
            })
        })
    }
}