// THIS FILE IS IGNORED BY VERSION CONTROL

// CREDENTIALS ======================
/*

  Instructions for spotify:-

  * Head to https://developer.spotify.com/dashboard/ and login if you haven't already.
  * Create a new application
  * Click to open the newly created application, copy and paste the credentials ( client id and secret ) here

  Instructions for Last.fm:-
  
  * Head to https://www.last.fm/api/accounts and login if you haven't already
  * Create a new application using the form
  * Retreive the api key of the application, copy and paste it here

*/

// CONFIG ===========================
/*
 SEARCH_LIMIT:-
              Description: Number of items to show as options
              Note: API limiations apply
              Default: 5 ( to not make terminal flooded up )

 DEFAULT_SEARCH:-
              Description: The search to start with, can be switched after searching from menu too
              Available options: last.fm or * ( anything ) to default spotify
              Default: 'spotify'
*/
module.exports = {

	SPOTIFY_CLIENT_ID: "Spotify client id here",
	SPOTIFY_CLIENT_SECRET: "Spotify client secret here",

	LASTFM_API_KEY: "Last.Fm api key here",

	SEARCH_LIMIT: 5,
	DEFAULT_SEARCH: 'spotify'

};