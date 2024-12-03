const http = require('http');
const url = require('url');
const { exec } = require('child_process');

const PORT = 8080

http.createServer(function (req, res) {
    var q = url.parse(req.url, true).query, features = {},
    guests, bedrooms, beds, baths, date;

    res.writeHead(200, {'Content-Type': 'text/html'});
    if (Object.keys(q).length) {
        guests = Number(q.guests);
        bedrooms = Number(q.bedrooms);
        beds = Number(q.beds);
        baths = Number(baths);
        if (guests) features.guests = guests;
        if (bedrooms) features.bedrooms = bedrooms;
        if (beds) features.beds = beds;
        if (baths) features.baths = baths;
        if (Object.keys(features).length) {
            date = new Date(q.date);
            if (date != "Invalid Date") {
                let arg = JSON.stringify({
                    features, 
                    date: date.toISOString().slice(0, 10)
                });
                exec("python predictor.py " + JSON.stringify(arg), (error, stdout, stderr) => {
                    if (stdout.startsWith("Error:")) {
                        res.end(`<p style='color:#ff5a5f'>${stdout}.</p>`)
                    } else {
                        res.end(`<h3 style="text-align: center; font-family: sans-serif; color: green">$${stdout}</h3>`);
                    }                        
                });
            } else {
                res.end("<p style='color:#ff5a5f'>Please provide a valid date.</p>")
            }
        } else {
            res.end("<p style='color:#ff5a5f'>Please provide at least one valid feature to predict on.</p>")
        }
    } else {
        res.end(`<!DOCTYPE HTML>
        <html>
        <head>
        <title>Price Predictor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="https://a0.muscache.com/airbnb/static/logotype_favicon-21cc8e6c6a2cca43f061d2dcabdf6e58.ico"/>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet"/>
        <style>
          body {
            font-family: 'Roboto', sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          form {
            max-width: 400px;
            width: 100%;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          form div {
            margin-bottom: 15px;
          }
          label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #333;
          }
          input[type="number"],
          input[type="date"] {
            width: calc(100% - 20px);
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
          }
          input[type="submit"] {
            width: 100%;
            padding: 10px;
            background-color: #ff5a5f;
            border: none;
            border-radius: 4px;
            color: #fff;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          input[type="submit"]:hover {
            background-color: #e14b50;
          }
          iframe {
            border: none;
            height: 60px;
            width: 100%;
          }
          #slider {
            background-color: mediumturquoise; 
            position: absolute; 
            top: 50%; 
            width: 25%; 
            border-radius: 18px; 
            height: 18px;
            animation-name: slide;
            animation-duration: 1s;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            animation-direction: alternate;
            display: none;
          }
          #slider.on {
            display: block;
          }
          #slider.on + iframe {
            display: none;
          }
          @keyframes slide {
            0% {
              left: 0%
            }
            50% {
              left: 37.5%
            }
            100% {
              left: 75%
            }
          } 
        </style>
        </head>
        <body>
        <form target="price-page" onsubmit="slider.classList.add('on'); submit.value = 'Predicting'; submit.style.backgroundColor='#9b2327'; submit.disabled = true">
            <h3 style="text-align: center; color: green"><span style="color: #ff5a5f">AirBnB</span> Price Predictor</h3>
            <div>
              <label for="guests">Guests</label>
              <input id="guests" min="0" max="10" name="guests" type="number"/>
            </div>
            <div>
              <label for="bedrooms">Bedrooms</label>
              <input id="bedrooms" min="0" max="10" name="bedrooms" type="number"/>
            </div>
            <div>
              <label for="beds">Beds</label>
              <input id="beds" min="0" max="10" name="beds" type="number"/>
            </div>
            <div>
              <label for="baths">Baths</label>
              <input id="baths" min="0" max="10" name="baths" type="number"/>
            </div>
            <div>
              <label for="date">Date</label>
              <input id="date" name="date" type="date"/>
            </div>
            <div style="position: relative; height: 90px">
              <label for="date">Price</label>
              <div id="slider"></div>
              <iframe id="page" name="price-page" onload="if (typeof submit === 'undefined') return; slider.classList.remove('on'); submit.value = 'Predict Price'; submit.style.backgroundColor=''; submit.disabled = false"></iframe>
            </div>
            <div>
              <input id="submit" type="submit" value="Predict Price"/>
            </div>
          </form>
        </body>
        </html>`);
    }
}).listen(PORT);

console.log(`http://localhost:${PORT}`);