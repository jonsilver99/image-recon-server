# This is a node server, acting as main external api for the image-recon app.

****************************************************************************************************
*03/03/2018 - reconfiged to integrate aws s3 service to resolve, serve and upload/store static files
****************************************************************************************************
To run localy:
    - at /package.json, set "start" to "nodemon server.js" (for dev mode)
    - run npm install (dependencies)

To run on hosted environment (heroku):
    - at /package.json, set "start" to "node server.js"