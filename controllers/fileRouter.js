const express = require('express');
const fileRouter = express.Router();
const fileHandler = require('../handlers/fileHandler');
const clarifai = require('../handlers/clarifai');
const http = require('http');

fileRouter.post("/upload", (req, res) => {

    fileHandler.saveAllFiles('public/uploads', req.files.uploads)
        .then((results) => {
            console.log(results);
            res.status(200).send(results);
        })
        .catch(err => {
            res.status(500).send(err)
        })
})

fileRouter.post("/like", (req, res) => {
    let userToken = req.headers.authorization;
    let pictureLiked = req.body.pic;
    fileHandler.handleNewPictureLike(userToken, pictureLiked)
        .then((result) => {
            console.log(result);
            res.status(200).send(result);
        })
        .catch((err) => {
            res.status(500).send(err.message)
        })
})

fileRouter.get("/getAllPics", (req, res) => {
    fileHandler.getAllDirFiles()
        .then((response) => {
            res.status(200).json(response);
        }).catch(err => {
            res.status(500).send(err)
        })
})

fileRouter.get("/recon/:picName", (req, res) => {
    let picPath = `public/uploads/${req.params.picName}`;
    return clarifai.reconPic(picPath)
        .then(tags => {
            console.log(tags);
            return res.status(200).json(tags);
        })

        .catch(err => {
            return res.status(err.status).send('Calrifai error or denial of service');
        })
})

module.exports = fileRouter;