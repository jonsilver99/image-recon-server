const fs = require('fs')
const Clarifai = require('clarifai');
// Clarifai module
const clarifai = new Clarifai.App({
    apiKey: 'bc885ee4ea384119bf0f49aa1752727d'
});

module.exports = {
    reconPic: (picPath) => {
        // get picture binary data
        let binaryData = fs.readFileSync(picPath);
        // get picture binary data
        let base64Pic = new Buffer(binaryData).toString('base64');

        return new Promise((resolve, reject) => {
            clarifai.models.predict(Clarifai.GENERAL_MODEL, { base64: base64Pic })
                .then(response => {
                    resolve(response.outputs[0].data.concepts)
                    // res.json(response.outputs[0].data.concepts);
                })
                .catch(err => reject(err));
        })
    }
}