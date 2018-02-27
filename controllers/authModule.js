const jwt = require('jsonwebtoken');
const fileHandler = require('../handlers/fileHandler');
const permissions = require('../constants/permissions');
let existingUsers = require('../data/users.json');

const authModule = {

    register: function (req, res) {
        const user = req.body.user
        if (!user) {
            res.status(404).end("No registration data sent");
        } else {
            user.liked_pictures = [];
            existingUsers.push(user);
            fileHandler.updateJsonFile('users', existingUsers)
                .then(msg => {
                    res.status(200).send('registration success');
                })
                .catch(err => {
                    res.status(500).send(err);
                })
        }
    },

    login: function (req, res, next) {
        const user = req.body.user
        if (!user) {
            res.status(404).end("No login data sent");
        } else {
            let matchedUser = authModule.searchUser(user);
            if (matchedUser) {
                // Generate a token based on this user credentials, Set that token as auth header and send a detailed response back to client 
                const authToken = jwt.sign(matchedUser, 'very-long-secret');
                // const authToken = jwt.sign()
                console.log(`Authorization header is ${authToken}`);
                res.setHeader("Authorization", authToken)
                // full response
                let loginReqStatus = { token: authToken, loginState: { isLoggedIn: true, role: matchedUser.role, liked_pictures: matchedUser.liked_pictures } };
                return res.status(200).json(loginReqStatus);
            } else {
                // if no matching users were found
                return res.status(401).send('This user is not registered');
            }
        }
    },

    verifyAuth: function (req, res, next) {

        let authToken = req.headers.authorization;
        if (authToken != null && authToken != '') {

            authModule.validateToken(authToken)
                .then((authStatus) => {
                    if (authStatus.validUser) {
                        // Upon successful auth - check request path for a further route (beyond /api).
                        //if further route exists call next(), otherwise respond "Ok" 
                        if (req.path == '/') {
                            // no further route - check user access permission
                            if (authModule.checkPermission(authStatus.validUser, req.query.clientRoute)) {
                                res.status(200).send('ok')
                            } else {
                                res.status(401).send('user has no permission to access this route')
                            }
                        } else {
                            // further route found (either '/getAllPics' or '/upload')
                            req.validUser = authStatus.validUser;
                            return next();
                        }
                    } else {
                        return res.status(401).send(authStatus.msg);
                    }
                })
                .catch((err) => {
                    return res.status(500).send(err);
                })

        } else {
            res.status(401).send("No authentication token given");
        }
    },

    validateToken: function (authToken) {
        return new Promise((resolve, reject) => {
            jwt.verify(authToken, 'very-long-secret', function (err, decoded) {
                if (err) {
                    console.log(err)
                    return reject({ validUser: false, msg: "Token validation process failed", errData: err });
                }
                // search a match for decoded user data
                let matchedUser = authModule.searchUser(decoded);
                if (matchedUser) {
                    return resolve({ validUser: matchedUser, msg: null, errData: null });
                } else {
                    // if no matching users were found
                    return resolve({ validUser: false, msg: "No mathces found for token - this user is not registered", errData: null });
                }
            });
        })
    },

    checkPermission: function (user, action) {
        let role = user.role;
        if (permissions[role].includes(action)) {
            return true;
        } else {
            return false;
        }
    },

    searchUser: function (user) {
        for (let i = 0; i < existingUsers.length; i++) {
            let existing = existingUsers[i];
            if (user.username == existing.username && user.password == existing.password) {
                // user match found - return matched user
                return existing;
            }
        }
        // if no matching users were found
        return false;
    }
}

module.exports = authModule;