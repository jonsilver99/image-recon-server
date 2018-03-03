const fs = require('fs');
// AWS
const AWS = require('../external-services/aws-service');
let likesMap = require('../data/pic-likes-map.json');
let existingUsers = require('../data/users.json');
let existingPics = require('../data/picnames.json');

class FileHandler {

    // save the names of the image files uploaded to s3, in the data/picnames.json file
    static saveAllFiles(fileNames) {
        if (!fileNames) {
            throw ('no file names recieved');
        }
        if (!Array.isArray(fileNames)) {
            fileNames = [fileNames];
        }
        for (let i = 0; i < fileNames.length; i++) {
            // if picname already exists in array dont save it again
            if (!existingPics.includes(fileNames[i])) {
                existingPics.push(fileNames[i])
            }
        }
        return this.updateJsonFile('picnames', existingPics)
            .then((result) => {
                console.log(result);
                // save an object entry ({'picname': # of likes}) in the 'likes-map.json' file. this entry will store the picture's likes
                fileNames.forEach((filename) => {
                    likesMap[filename] = 0;
                });
                return this.updateJsonFile('pic-likes-map', likesMap);
            })
            .then((result) => {
                console.log(result);
                return "Upload process successful, Files saved, likes map updated";
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