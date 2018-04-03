//require .env file//
require("dotenv").config();

//require keys.js file//
var keys = require('./keys.js');

//require Spotify//
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);

//require Twitter//
var Twitter = require('twitter');
var client = new Twitter(keys.twitter);

var params = {
    screen_name: 'lea_test84',
    count: 20
};

//require request for OMDB//
var request = require('request');

//get user  entered commands//
var command = process.argv[2];
var searchString = process.argv[3];


//what to return - based on command & search string entered//
switch (command) {
    case 'my-tweets':
        client.get('statuses/user_timeline', params, function (error, tweets, response) {
            if (!error) {
                for (let i = 0; i < tweets.length; i++) {
                    let tweet = tweets[i].created_at + ":     " + tweets[i].text
                    console.log(tweet);
                }
            }
        });
        break;

    case 'spotify-this-song':
        spotify.search({ type: 'track', query: 'All the Small Things' }, function (err, data) {
            if (err) {
                return console.log('Error occurred: ' + err);
            }

            console.log(data);
        });
        break;

    case 'movie-this':
        if (searchString) {
            searchString
        }
        else { searchString = 'mr nobody' }

        request('http://www.omdbapi.com/?apikey=trilogy&t=' + searchString, function (error, response, body) {
            if (error) {
                return console.log('Error ocurred: ' + error);
            }
            
            var result
            result = JSON.parse(body);
            console.log(result);
            console.log('Title: ' + result.Title);
            console.log('Year: ' + result.Year);
            console.log('IMDB Rating: ' + result.imdbRating);
            console.log('Rotten Tomatoes Rating: ' + result.Ratings[1].Value);
            console.log('Country: ' + result.Country);
            console.log('Language: ' + result.Language);
            console.log('Plot: ' + result.Plot);
            console.log('Actors: ' + result.Actors)
            
        });
        break;

    case 'do-what-it-says':
        console.log('do-what-it-says');
        break;

}

