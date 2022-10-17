# EasyAudioTagger
A cli tool to tag your audio files quickly and easily ( written in node.js )

## Installation
* Make sure you have [node](https://nodejs.org/en/download/) installed.
* Clone this repo
```
git clone https://github.com/jaxparrow07/EasyAudioTagger.git
```
* CD into that directory
```
cd EasyAudioTagger
```
* Install the npm dependencies
```
npm install
```
* Done
```
node app.js "file name"
```

## Demo
[![asciicast](https://asciinema.org/a/507491.svg)](https://asciinema.org/a/507491)

## Configuration
These variables can be configured via `config.js` file

### # API & Credentials
**_SPOTIFY_CLIENT_ID_,**<br>
**_SPOTIFY_CLIENT_SECRET_:**
<br>
Instructions for spotify:-<br>

* Head to https://developer.spotify.com/dashboard/ and login if you haven't already.
* Create a new application
* Click to open the newly created application, copy and paste the credentials ( client id and secret ) in the 'config.js' file

**_LASTFM_API_KEY_:**<br>
Instructions for Last.fm:-<br>
  
  * Head to https://www.last.fm/api/accounts and login if you haven't already
  * Create a new application using the form
  * Retreive the api key of the application, copy and paste it in the 'config.js' file

### # Options
**_SEARCH_LIMIT_**:<br>
            Description: Number of items to show as options<br>
            Note: API limiations apply<br>
            Default: 5 ( to not make terminal flooded up )<br>
<br>
**_DEFAULT_SEARCH_**:<br>
            Description: The search to start with, can be switched after searching from menu too<br>
            Available options: last.fm or * ( anything ) to default spotify<br>
            Default: 'spotify'<br>
<br>
## Extra Info
If you want to run this script from anywhere ( without absolute path ). You can try ![adding this to **PATH**](https://linuxize.com/post/how-to-add-directory-to-path-in-linux/) or by creating an alias.<br>
_Wrapper example_:
```sh
#!/usr/bin/env bash
node "/ <absolute path to the repo> /app.js" "$1"
```
and add this wrapper script to your PATH
