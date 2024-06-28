require('dotenv').config();
const express = require('express');
const axios = require('axios');
const http = require('http');
const https = require('https');
const fs = require('fs');

const app = express();
const portHttp = process.env.portHttp || 80;
const portHttps = process.env.portHttps || 443;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {

});

http.createServer(app).listen(portHttp, () => {
    console.log(`Server is running on port ${portHttp}`);
})

https.createServer({
    key: fs.readFileSync('localhost.key'),
    cert: fs.readFileSync('localhost.crt')
}, app).listen(portHttps, () => {
    console.log(`Server is running on port ${portHttps}`);
});