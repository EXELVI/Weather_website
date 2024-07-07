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

function getTodayDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // +1 because the months are zero-based
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
}


function getWeatherEmoji(iconCode) {
    switch (iconCode) {
        case "01d":
            return "bi bi-sun-fill";
        case "01n":
            return "bi bi-moon-fill";
        case "02d":
            return "bi bi-cloud-sun-fill";
        case "02n":
            return "bi bi-cloud-moon-fill";
        case "03d":
            return "bi bi-cloudy-fill";
        case "03n":
            return "bi bi-cloudy-fill";
        case "04d":
            return "bi bi-cloudy-fill";
        case "04n":
            return "bi bi-cloudy-fill";
        case "09d":
            return "bi bi-cloud-drizzle-fill";
        case "09n":
            return "bi bi-cloud-drizzle-fill";
        case "10d":
            return "bi bi-cloud-rain";
        case "10n":
            return "bi bi-cloud-rain";
        case "11d":
            return "bi bi-cloud-lightning-rain-fill";
        case "11n":
            return "bi bi-cloud-lightning-rain-fill";
        case "13d":
            return "bi bi-snow";
        case "13n":
            return "bi bi-snow";
        case "50d":
            return "bi bi-cloud-fog2-fill";
        case "50n":
            return "bi bi-cloud-fog2-fill";
        default:
            return "";
    }
}

function getWeatherImage(iconCode) {
    switch (iconCode) {
        case "01d":
            return "./images/sunny.jpeg";
        case "01n":
            return "./images/moon.jpg";
        case "02d":
            return "./images/cloudsun.jpg";
        case "02n":
            return "./images/wallpaperflare.com_wallpaper.jpg";
        case "03d":
            return "./images/sam-schooler-E9aetBe2w40-unsplash.jpg";
        case "03n":
            return "./images/cloudynight.jpg";
        case "04d":
            return "./images/brokenClouds.jpg";
        case "04n":
            return "./images/brokenClouds.jpg";
        case "09d":
            return "./images/rain.jpg";
        case "09n":
            return "./images/rainnight.jpg";
        case "10d":
            return "./images/rain.jpg";
        case "10n":
            return "./images/rainnight.jpg";
        case "11d":
            return "./images/lightingDay.jpg";
        case "11n":
            return "./images/lightingNight.jpg";
        case "13d":
            return "./images/snowDay.jpg";
        case "13n":
            return "./images/snowNight.jpg";
        case "50d":
            return "./images/fogDay.jpg";
        case "50n":
            return "./images/fogNight.jpg";
        default:
            return "";
    }
}


app.get('/', async (req, res) => {
    let quote = JSON.parse(await fs.readFileSync("quote.json", "utf8"))
    
    if (Date.now() - quote.updated > 36000000) {    //If is more than 10 hours since the last update 
        let response = await axios.get('https://quotes.rest/qod', {
            headers: {
                Authorization: `Bearer ${process.env.theySaidSoApi}` //BearerAuth  (http, Bearer)
            }

        }).catch(err => console.log(err.response));
        if (response?.data?.status != 200) {
            console.log("Error getting the quote");
            console.log(response?.data?.status, response?.data?.message);
            return res.render('index', { quote: quote, cod: response?.data?.status || "???", data: response?.data?.message || "Error getting the quote" });
        }

        quote = {
            quote: response.data.contents.quotes[0],
            updated: Date.now()
        }

        fs.writeFileSync("quote.json", JSON.stringify(quote, null, 3));
    }  

    res.render('index', { quote: quote.quote, cod: "", data: "" });
});


function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

app.get('/search', async (req, res) => {
    const city = req.query?.q
    const language = "en-US"
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.apiKey}&units=metric&lang=${language}`;

    try {
        const response = await axios.get(url);
        const weatherData = response.data;
        var iconamars = getWeatherEmoji(weatherData.weather[0].icon)
        weatherData.weather[0].description = weatherData.weather[0].description.charAt(0).toUpperCase() + weatherData.weather[0].description.slice(1);

        res.render('search', { city: req.query?.q || "Meucci", weatherData: weatherData, icon: iconamars, formatAMPM: formatAMPM, image: getWeatherImage(weatherData.weather[0].icon) });
    } catch (error) {
        console.error("Error: ", error.response.data);
        let quote = JSON.parse(await fs.readFileSync("quote.json", "utf8"))
        if (error.response.data?.message) {
            return res.render('index', { cod: error.response.data?.cod, data: error.response.data?.message, quote: quote.quote });
        }
    }
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