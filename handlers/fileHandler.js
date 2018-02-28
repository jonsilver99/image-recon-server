const fs = require('fs');
// const authModule = require('../controllers/authModule');
let likesMap = require('../data/pic-likes-map.json');
let existingUsers = require('../data/users.json');

class FileHandler {

    // save all uploaded images
    static saveAllFiles(savePath, uploads) {
        if (!uploads) {
            throw ('no files uploaded');
        }

        if (!Array.isArray(uploads)) {
            uploads = [uploads];
        }

        function saveOne(file) {
            return new Promise((resolve, reject) => {
                file.mv(`${savePath}/${file.name}`, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(file.name);
                    }
                })
            })
        }

        return Promise.all(uploads.map((file) => {
            return saveOne(file)
        }))
            .then((savedFilesNames) => {
                // save an object entry ({'picname': # of likes}) in the 'likes-map.json' file. this entry will store the picture's likes
                savedFilesNames.forEach((filename) => {
                    likesMap[filename] = 0;
                });
                return this.updateJsonFile('pic-likes-map', likesMap);
            })
            .then((updateStatus) => {
                console.log(updateStatus);
                return "Upload process successful, Files saved, likes map updated";
            })
            .catch(err => {
                throw (err);
            })
    }

    // get all uploaded images's names
    static getAllDirFiles() {
        return new Promise((resolve, reject) => {
            fs.readdir("public/uploads", (err, fileNames) => {
                if (err) {
                    reject(err)
                }
                else {
                    fileNames = fileNames.filter((name)=>{
                        return name != '.keep';
                    })
                    resolve(fileNames);
                }
            });
        });
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