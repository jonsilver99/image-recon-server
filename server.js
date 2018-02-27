const express = require('express');
const headers_setup = require('./controllers/headers_setup');
const bodyParser = require('body-parser');
const expressFileUpload = require('express-fileupload');
const authModule = require('./controllers/authModule');
const fileRouter = require('./controllers/fileRouter');

// init express
const server = express();
// port
const PORT = process.env.PORT || 4400

// headers definition middelware
server.use(headers_setup);

// parsers middleware
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())
server.use(expressFileUpload());

// static files fetching
server.use('/assets/uploads', express.static(__dirname + "/public/uploads"))



//*************************************//
// Deploy testing routes
server.use("/", (req, res, next) => {
    const fileHandler = require('./handlers/fileHandler');
    fileHandler.getAllDirFiles()
        .then((response) => {
            res.status(200).send(response);
        }).catch(err => {
            res.status(500).send(err)
        })
});
//*************************************//



// Routing
server.use("/register", authModule.register);
server.use("/login", authModule.login);
server.use("/api", authModule.verifyAuth);
server.use("/api/files", fileRouter);

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});