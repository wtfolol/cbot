let fs = require('fs');
let readline = require('readline');
let googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR =//'https://rawgit.com/wtfolol/cbot/master/';
 (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/desktop/cbot/';
var TOKEN_PATH = TOKEN_DIR + 'quickstart.json';
//const TOKEN_PATH ='./quickstart.json'; //the file which will contain the token

class Authentication {
  authenticate(){
    return new Promise((resolve, reject)=>{
      let credentials = this.getClientSecret();
      let authorizePromise = this.authorize(credentials);
      authorizePromise.then(resolve, reject);
    });
  }
  getClientSecret(){
    //return require("https://rawgit.com/wtfolol/cbot/master/client_secret.json");
    return require("./client_secret.json");
  }
  authorize(credentials) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    return new Promise((resolve, reject)=>{
      // Check if we have previously stored a token.
      fs.readFile('./quickstart.json', (err, token) => {
          oauth2Client.credentials = JSON.parse(token);
          resolve(oauth2Client);
      });
    });
  }
}

module.exports = new Authentication();
