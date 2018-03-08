const express = require('express');
const fileRouter = express.Router();
const fileHandler = require('../handlers/fileHandler');
const clarifai = require('../external-services/clarifai');
const AWSHnadler = require('../external-services/aws-service');
const http = require('http');

fileRouter.post("/upload", (req, res) => {
    // save needed data about the file/s, freshly uploaded to S3
    fileHandler.processUploadedFiles(req.files.upload_candidates)
        .then((results) => {
            console.log(results);
            res.status(200).send(results);
        })
        .catch(err => {
            let errMsg = err.message || err;
            res.status(500).send(errMsg);
        })
})

fileRouter.post("/like", (req, res) => {
    // add picture name to logged in user's likes array
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
    // get all pic url's from s3 bucket
    AWSHnadler.getAllPictures()
        .then((results) => {
            res.status(200).json(results);
        }).catch(err => {
            res.status(500).send(err)
        })
})

fileRouter.get("/recon/:picName", (req, res) => {
    // download the picture object from s3 bucket, then send the pic's binary data to clarifai recon
    return AWSHnadler.downloadPictureObject(req.params.picName)
        .then(picObj => {
            return clarifai.reconPic(picObj.Body)
        })
        .then(tags => {
            return res.status(200).json(tags);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status).send('Calrifai error or denial of service');
        })
})

module.exports = fileRouter;