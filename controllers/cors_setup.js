module.exports = (req, res, next) => {
    res.header({
        
        // Client allowed to connect
        'Access-Control-Allow-Origin': 'https://image-recon-app.herokuapp.com',
        // 'Access-Control-Allow-Origin': '*',
        // 'Access-Control-Allow-Origin': 'http://localhost:4200',
        
        // Request methods you wish to allow
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, PATCH, DELETE",
        // Request headers you wish to allow
        "Access-Control-Allow-Headers": "authorization, Origin, X-Requested-With, Content-Type, Accept",
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        "Access-Control-Allow-Credentials": true,
        // "Access-Control-Expose-Headers": "*"
    });
    if (req.method === 'OPTIONS') {
        console.log('OPTIONS SUCCESS');
        res.end();
        // next();
        return;
    }
    // Pass to next layer of middleware
    next();
}