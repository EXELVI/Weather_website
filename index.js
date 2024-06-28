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



app.get('/', async (req, res) => {
    let quote = JSON.parse(await fs.readFileSync("quote.json", "utf8"))
    //If is more than 10 hours since the last update (quote.updated)
    if (Date.now() - quote.updated > 36000000) {
        //BearerAuth  (http, Bearer)
        let response = await axios.get('https://quotes.rest/qod', {
            headers: {
                Authorization: `Bearer ${process.env.theySaidSoApi}`
            }

        }).catch(err => console.log(err.response.data));
        if (!response?.data) {
            console.log("Error getting the quote");
            return res.render('index', { quote: quote, cod: "Error getting the quote", data: "" });
        }

        quote = {
            quote: response.data.contents.quotes[0],
            updated: Date.now()
        }

        fs.writeFileSync("quote.json", JSON.stringify(quote, null, 3));
    }


    res.render('index', { quote: quote });

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