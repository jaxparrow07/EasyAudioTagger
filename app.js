const request = require('request');
const fs = require('fs');
const readline = require('readline-sync');
const path = require('path');
const NodeID3 = require('node-id3')
const download = require('download');
const clc = require('cli-color');
const configFile = require('./config');


// ======================================
// Check `config.js` for options/settings
// ======================================

async function refreshSpotifyToken(fileName) {

  /* This function was added to avoid refreshing tokens or calling the api often to retreive the token
     only if the previous one was expired or invalid. Might save time.
  */

  console.log(clc.bold(clc.blue("[*]")) + " Refreshing Token");
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(configFile.SPOTIFY_CLIENT_ID + ':' + configFile.SPOTIFY_CLIENT_SECRET).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      fs.writeFile(__dirname + '/.token',body.access_token,function (err) {
        if (err) {
          console.log(clc.bold(clc.red("[x]")) + " Couldn't refresh token");
        } else {
          if (fileName)
            searchSpotify(fileName);
        }
      });
    }
  });
}

async function processFile(fileName, songMeta, albumArtUrl) {

  var filepath = path.resolve(fileName)

  if (!fs.existsSync(__dirname + '/temp')) {
    fs.mkdirSync(__dirname + '/temp');
  }
  if (fs.existsSync(__dirname + 'temp/album.png')) {
    fs.unlinkSync(__dirname + 'temp/album.png');
  }

  console.log(clc.bold(clc.blue("[*]")) + ' Downloading Album Art');
  fs.writeFileSync(__dirname + '/temp/album.png', await download(albumArtUrl));

    var success = NodeID3.write(songMeta, filepath);

    if (success) {
      console.log(clc.bold("[-]") + " Set " + Object.keys(songMeta));
      console.log(clc.bold(clc.green("[+]")) + " Done");
    }

}

async function searchSpotify(fileName) {

      var baseName = path.basename(fileName);
      var songName = readline.question(clc.bold(clc.green("spotify: ")) + `Enter song name (${baseName}) : `);

      if (!songName)
        songName = baseName.substring(0, baseName.lastIndexOf('.'));

      if (!fs.existsSync(__dirname + "/.token")) {
          refreshSpotifyToken(fileName);
          return;
      }

      var token = fs.readFileSync(__dirname + "/.token").toString();

      var searchQuery = songName.trim().replaceAll(' ','+');

      var options = {

        url: `https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=${configFile.SEARCH_LIMIT}`,

        headers: {
          'Authorization': 'Bearer ' + token
        },

        json: true
      }
      console.log(clc.bold(clc.blue("[*]")) + " Searching " + songName + "...");
      request.get(options, function(error, response, body) {

        if (response.statusCode === 401) {
          refreshSpotifyToken(fileName);
          return;
        }

        if (!error && response.statusCode === 200) {
          console.log(clc.bold("[-]") + " Please select the best one\n");

          var searchTracks = body.tracks.items;

          if (searchTracks.length === 0) {
            console.log(clc.bold(clc.yellow("[!]")) + " Empty search: Please search again using different keywords or use other service");
          }

          for (const trackIndex in searchTracks) {

            var currentTrack = searchTracks[trackIndex];
            var trackHR = (parseInt(trackIndex) + 1);
            console.log(`${trackHR}. ${currentTrack.name} - ${currentTrack.artists[0].name} - (${currentTrack.album.name})`);

          }
          console.log("s. Search again\nc. Search using " + clc.bold(clc.red("last.fm")) + "\nq. Quit");

          var userInput = readline.question('\nSelect any option: ');

          switch(userInput) {
            case "s":
              searchSpotify(fileName);
              return;break;
            case "c":
              searchLastFM(fileName);
              return;break;
            case "q":
              return;break;
            default:
              break;
          }

          var userSelectionIndex = Number(userInput) - 1;

          while (userSelectionIndex > searchTracks.length || isNaN(userSelectionIndex)) {
            console.log(clc.bold(clc.yellow("[!]")) + " Invalid option");
            
            userInput = readline.question('\nSelect any option: ');

            switch(userInput) {
              case "s":
                searchSpotify(fileName);
                return;break;
              case "c":
                searchLastFM(fileName);
                return;break;
              case "q":
                return;break;
              default:
                break;
            }

            userSelectionIndex = Number(userInput) - 1;


          }

          var trackInfo = searchTracks[userSelectionIndex];

          // Constructing metadata for NODEID3
          var songMeta = {
            title: trackInfo.name,
            artist: trackInfo.artists[0].name,
            album: trackInfo.album.name,
            image: __dirname + '/temp/album.png',
            performerInfo: trackInfo.album.artists[0].name,
            artistUrl: "https://open.spotify.com/artist/" + trackInfo.artists[0].id,
            trackNumber: trackInfo.track_number,
            date: trackInfo.album.release_date
          }

          processFile(fileName, songMeta, trackInfo.album.images[0].url);

        } else if (response.statusCode === 429 ) {
          console.log(clc.bold(clc.red("[x]")) + " Too many requests: Try again later");
        }

      });
}

async function searchLastFM(fileName) {

      var baseName = path.basename(fileName);
      var songName = readline.question(clc.bold(clc.red("last.fm: ")) + `Enter song name (${baseName}) : `);

      if (!songName)
        songName = baseName.substring(0, baseName.lastIndexOf('.'));

      var searchQuery = songName.trim().replaceAll(' ','+');

      var options = {

        url: `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${searchQuery}&api_key=${configFile.LASTFM_API_KEY}&limit=${configFile.SEARCH_LIMIT}&format=json`
      
      };
      console.log(clc.bold(clc.blue("[*]")) + " Searching " + songName + "...");
      request.get(options, function(error, response, body) {


        if (!error && response.statusCode === 200) {
          console.log(clc.bold(clc.bold("[-]")) + " Please select the best one\n");

          var searchTracks = JSON.parse(body).results.trackmatches.track;

          if (searchTracks.length === 0) {
            console.log(clc.bold(clc.yellow("[!]")) + " Empty search: Please search again using different keywords or use other service");
          }

          for (const trackIndex in searchTracks) {

            var currentTrack = searchTracks[trackIndex];
            var trackHR = (parseInt(trackIndex) + 1)
            console.log(`${trackHR}. ${currentTrack.name} - ${currentTrack.artist}`);

          }
          console.log("s. Search again\nc. Search using " + clc.bold(clc.green("Spotify")) + "\nq. Quit");

          var userInput = readline.question('\nSelect any option: ');

          switch(userInput) {
            case "c":
              searchSpotify(fileName);
              return;break;
            case "s":
              searchLastFM(fileName);
              return;break;
            case "q":
              return;break;
            default:
              break;
          }

          var userSelectionIndex = Number(userInput) - 1;

          while (userSelectionIndex > searchTracks.length || isNaN(userSelectionIndex)) {
            console.log(clc.bold(clc.yellow("[!]")) + " Invalid option");
            
            userInput = readline.question('\nSelect any option: ');

            switch(userInput) {
              case "c":
                searchSpotify(fileName);
                return;break;
              case "s":
                searchLastFM(fileName);
                return;break;
              case "q":
                return;break;
              default:
                break;
            }

            userSelectionIndex = Number(userInput) - 1;


          }

          var addSearchQuery = "track="  + searchTracks[userSelectionIndex].name.replaceAll(' ','+') + "&artist=" + searchTracks[userSelectionIndex].artist.replaceAll(' ','+'); 
          request.get({url: `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${configFile.LASTFM_API_KEY}&${addSearchQuery}&format=json` }, function(add_track_error, add_track_response, add_track_body) {

            if (!add_track_error && add_track_response.statusCode === 200) {

              var trackInfo = JSON.parse(add_track_body).track;

              // Last.fm's API doesn't have basic info for some entries, so it's to check if any important tag is missing.
              if (trackInfo.album === undefined || trackInfo.artist === undefined) {
                 console.log(clc.bold(clc.yellow("[!]")) + " Not enough metadata: Please search again using a different keyword")
                 searchLastFM(fileName);
                 return;
              }

              var songMeta = {

                title: trackInfo.name,
                artist: trackInfo.artist.name,
                album: trackInfo.album.title,
                image: __dirname + '/temp/album.png',
                performerInfo: trackInfo.album.artist,
                artistUrl: trackInfo.artist.url

              }

              processFile(fileName, songMeta, trackInfo.album.image[3]['#text']);

            }

          });


        } else if (response.statusCode === 29 ) {
          console.log(clc.bold(clc.red("[x]")) + " Too many requests: Try again later");
        }

      });
}

// Entry to the script
const appArgs = process.argv.slice(2);

if (configFile.DEFAULT_SEARCH === "last.fm") {
  searchLastFM(appArgs[0]);
} else {
  searchSpotify(appArgs[0]);
}
