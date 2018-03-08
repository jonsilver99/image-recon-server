const fs = require('fs');
// AWS
const AWS = require('../external-services/aws-service');
let likesMap = require('../data/pic-likes-map.json');
let existingUsers = require('../data/users.json');
let existingPics = require('../data/picnames.json');

class FileHandler {

    static processUploadedFiles(files) {

        if (!files) {
            return Promise.reject('no file recieved');
        }
        if (!Array.isArray(files)) {
            files = [files];
        }

        // validate upload contents
        let payloadStatus = this.validatePayload(files);
        if (payloadStatus.isValid === false) {
            return Promise.reject(payloadStatus.message);
        }

        // 1 Upload all files to s3 bucket
        return Promise.all(files.map(file => {
            return AWS.uploadFileToS3Bucket(file)
        }))
            .then((uploaded) => {
                return this.saveNewFilesInfo(uploaded.map((file) => {
                    return file.Key;
                }))
            })
            .catch(err => {
                throw (err);
            })
    }

    static validatePayload(files) {
        let payloadStatus = {
            isValid: null,
            message: null
        }
        let totalSize = 0;
        try {
            for (let i = 0; i < files.length; i++) {
                if (!files[i].mimetype.includes('image', 0)) {
                    throw 'Unsupported file type in payload. upload process aborted'
                }
                totalSize += files[i].data.byteLength;
            }
            if (totalSize / 1000000 >= 5) {
                throw "Max Payload size Exceeded. Try Uploading less files";
            }
            return payloadStatus.isValid = true;
        }
        catch (errMsg) {
            payloadStatus.isValid = false;
            payloadStatus.message = errMsg;
            return payloadStatus;
        }
    }

    static saveNewFilesInfo(fileNames) {

        if (!fileNames) {
            throw ('no file names recieved');
        }
        if (!Array.isArray(fileNames)) {
            fileNames = [fileNames];
        }

        // 2 save uploaded files names in the picnames.json
        for (let i = 0; i < fileNames.length; i++) {
            // if picname already exists in array dont save it again
            if (!existingPics.includes(fileNames[i])) {
                existingPics.push(fileNames[i])
            }
        }
        return this.updateJsonFile('picnames', existingPics)
            .then((result) => {
                console.log(result);
                fileNames.forEach((filename) => {
                    likesMap[filename] = 0;
                });
                // 3 save an entry for each picture file in the pic-likes-map.json. this entry will count the picture's likes
                return this.updateJsonFile('pic-likes-map', likesMap);
            })
            .then((result) => {
                console.log(result);
                return "Upload process successful, Files info saved, likes map updated";
            })
            .catch(err => {
                throw (err);
            })
    }

    // Update a json data file
    static updateJsonFile(filename, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(`data/${filename}.json`, JSON.stringify(data), 'utf8', (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(`${filename}.json file updated`);
                }
            });
        });
    }

    static async handleNewPictureLike(userToken, picture) {
        const authModule = require('../controllers/authModule');
        let result = {
            picName: picture,
            status: null,
            msg: null,
            likePic: 'pending',
        }
        return (async function () {
            try {
                let decoded = await authModule.validateToken(userToken);
                let user = existingUsers[existingUsers.indexOf(decoded.validUser)];

                if (user.liked_pictures.includes(picture)) {
                    // user asked to unlike pic
                    user.liked_pictures.splice(user.liked_pictures.indexOf(picture), 1);
                    result.likePic = false;
                    result.msg = `User '${user.username}' unliked picture '${picture}'`;
                } else {
                    // user asked to like pic
                    user.liked_pictures.push(picture);
                    result.likePic = true;
                    result.msg = `User '${user.username}' liked picture '${picture}'`;
                }
                let updatedfile = await this.updateJsonFile('users', existingUsers);
                result.status = 'ok';
                return result;
            }
            catch (err) {
                throw err;
            }
        }.bind(this))();
    }
}
module.exports = FileHandler;