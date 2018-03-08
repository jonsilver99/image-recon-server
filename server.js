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
server.use("/assets/files", (req, res, next) => {
    console.log('Requested staic file:', req.url);
    next();
},
    express.static(__dirname + "/public/files")
);

// Routing
server.use("/register", authModule.register);
server.use("/login", authModule.login);
server.use("/api", authModule.verifyAuth);
server.use("/api/files", fileRouter);

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});