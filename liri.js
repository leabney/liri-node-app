//require .env file//
require('dotenv').config();

//require fs//
var fs = require('fs')

//require inquirer//
var inquirer = require('inquirer');

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

//require OMDB//
var request = require('request');

//require chalk//
var chalk = require('chalk');

//require moment//
var moment = require('moment');

//search variables//
var command;
var searchString;

//print blank line for readability//
console.log('');

//prompt user for input//
function start(){inquirer.prompt([
    {
        type: 'list',
        name: 'command',
        message: 'What would you like to do?',
        choices: ['View My Tweets', 'Get Movie Info', 'Get Song Info', 'Read from File']
    }
])
    //command response///
    .then(function (inquirerResponse) {
        //write command (request) to to log.txt file//
        fs.appendFile("log.txt",'----------------------------------------------\n'+ moment().format('dddd MMM Do YYYY, hh:mm a') + '\nRequest: ' + inquirerResponse.command + '\n', function (err) {
            if (err) {
                return console.log(err);
            }
        });

        //if "View My Tweets", then call function myTweets//
        if (inquirerResponse.command === 'View My Tweets') {
            myTweets();
        }
        //ask user for title//
        if (inquirerResponse.command === 'Get Movie Info') {
            inquirer.prompt([
                {
                    type: 'text',
                    name: 'searchString',
                    message: 'Enter movie title:  '
                }
            ])
                .then(function (inquirerResponse) {

                    //if searchString is not entered by user, search for Mr. Nobody//
                    if (inquirerResponse.searchString === '') {
                        searchString = 'mr nobody'

                        console.log('\nIf you haven\'t watched "Mr. Nobody", then you should!:')
                        console.log('<http://www.imdb.com/title/tt0485947/>');
                        console.log('\nIt\'s on Netflix!\n');
                    }
                    //if searchString supplied, use it//
                    else { searchString = inquirerResponse.searchString }
                    movieThis();
                    
                })
        }

        if (inquirerResponse.command === 'Get Song Info') {
            //ask user for title//
            inquirer.prompt([
                {
                    type: 'text',
                    name: 'searchString',
                    message: 'Enter song title:  ',
                }
            ])
                .then(function (inquirerResponse) {
                    //if search string not entered, search for the sign//
                    if (inquirerResponse.searchString === '') {
                        searchString = 'the sign ace of base'
                    }
                    //otherwise, use search string//
                    else { searchString = inquirerResponse.searchString }

                    //get information from spotify//
                    songThis();

                })
        }

        if (inquirerResponse.command === 'Read from File'){
            console.log('Read from File');

            fs.readFile("random.txt", "utf8", function(error, data) {
                if (error) {
                  return console.log(error);
                }
                            
                var dataArr = data.split(",");

                switch(dataArr[0]){
                    case 'spotify-this-song':
                        command='Get Song Info';
                        searchString=dataArr[1];
                        songThis();
                        break;
                    case 'movie-this':
                        command='Get Movie Info';
                        searchString=dataArr[1];
                        movieThis();
                        break;
                    case 'my-tweets':
                        command='View My Tweets';
                        myTweets();
                        break;
                }
              
              });
        }

    });
};

start();

//FUNCTIONS//

//TWEETS//
function myTweets() {
    //print to console for readability//
    console.log(chalk.bgCyan('\n***********************'));
    console.log(chalk.bgCyan('*    RECENT TWEETS    *'));
    console.log(chalk.bgCyan('***********************'));

    //get tweets from twitter//
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        //print if error//
        if (error) {
            console.log(error);
        }
        //if no error, print 20 most recent tweets & log to file//
        else {
            for (let i = 0; i < tweets.length; i++) {
                let tweet = tweets[i].created_at + ':     ' + tweets[i].text
                console.log(tweet);

                //log tweets//
                fs.appendFile("log.txt", tweet + '\n', function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });
            }
        }
        console.log('\n');
        start();
    });
}

//MOVIES//
function movieThis() {
    //print to console for readability//
    console.log(chalk.bgCyan('\n***********************'));
    console.log(chalk.bgCyan('*  MOVIE INFORMATION  *'));
    console.log(chalk.bgCyan('***********************'));

    //make request to OMDB//
    request('http://www.omdbapi.com/?apikey=trilogy&t=' + searchString, function (error, response, body) {

        //if error, print error//
        if (error) {
            return console.log(error);
        }

        //else, parse result//
        
        else {var result
        result = JSON.parse(body);

        //find Rotten Tomatoes rating//
        var rottenTomatoesRating;

        for (var i = 0; i < result.Ratings.length; i++) {
            if (result.Ratings[i].Source === 'Rotten Tomatoes') {
                rottenTomatoesRating = result.Ratings[i].Value
            }

        }

        //console log movie information//
        console.log('Title: ' + result.Title);
        console.log('Year: ' + result.Year);
        console.log('IMDB Rating: ' + result.imdbRating);
        console.log('Rotten Tomatoes Rating: ' + rottenTomatoesRating);
        console.log('Country: ' + result.Country);
        console.log('Language: ' + result.Language);
        console.log('Plot: ' + result.Plot);
        console.log('Actors: ' + result.Actors)

        //log results to log file//
        fs.appendFile("log.txt",
            'Search String: ' + searchString  + '\n' +
            'Title: ' + result.Title + '\n' +
            'Year: ' + result.Year + '\n' +
            'IMDB Rating: ' + result.imdbRating + '\n' +
            'Rotten Tomatoes Rating: ' + rottenTomatoesRating + '\n' +
            'Country: ' + result.Country + '\n' +
            'Language: ' + result.Language + '\n' +
            'Plot: ' + result.Plot + '\n' +
            'Actors: ' + result.Actors + '\n'

            , function (err) {
                if (err) {
                    return console.log(err);
                }

            });
        }
            console.log('\n');
        start();
    });
}

//SONGS//
function songThis() {
    console.log(chalk.bgCyan('\n**********************'));
    console.log(chalk.bgCyan('*  SONG INFORMATION  *'));
    console.log(chalk.bgCyan('**********************'));



    spotify.search({ type: 'track', query: searchString, limit: 1, json: true }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        else {

        if (data.tracks.items[0].preview_url === null) {
            var preview = 'not available'
        }
        else { preview = data.tracks.items[0].preview_url }
        console.log('Artist: ' + data.tracks.items[0].album.artists[0].name)
        console.log('Album: ' + data.tracks.items[0].album.name);
        console.log('Track: ' + data.tracks.items[0].name)
        console.log('Preview URL: ' + preview)

        fs.appendFile("log.txt",
            'Search String: ' + searchString + '\n' +
            'Artist: ' + data.tracks.items[0].album.artists[0].name + '\n' +
            'Album: ' + data.tracks.items[0].album.name + '\n' +
            'Track: ' + data.tracks.items[0].name + '\n' +
            'Preview URL: ' + preview + '\n'
            , function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        };
        console.log('\n');
        start();
    });
}