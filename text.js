var builder = require('botbuilder');
var restify = require('restify');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
let authentication = require("./authentication");
var array = [];

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create connector and listen for messages
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen());

// Setup bot with default dialog
var bot = new builder.UniversalBot(connector, function (session) {
    session.beginDialog('createAlarm');
});

bot.dialog('createAlarm', [
  function (session) {
      session.dialogData.alarm = {};
      builder.Prompts.text(session, "What would you like to name this alarm?");
  },
  function (session, results, next) {
      if (results.response) {
          session.dialogData.name = results.response;
          builder.Prompts.text(session, "What time would you like to set an alarm for?");
      } else {
          next();
      }
  },
  function (session, results) {
      if (results.response) {
          session.dialogData.text = results.response;
      }
      // Return alarm to caller  
      if (session.dialogData.name && session.dialogData.text) {
            array = [session.dialogData.name , session.dialogData.text];
        authentication.authenticate().then((auth)=>{
            appendData(auth,array);
        });
          session.endDialogWithResult({ 
              response: { name: session.dialogData.name, time: session.dialogData.text } 
          });
         
      } else {
          session.endDialogWithResult({
              resumed: builder.ResumeReason.notCompleted
          });
      }
  }
]);

function appendData(auth,arrayx) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.append({
    auth: auth,
    spreadsheetId: '15M6lPILyUsc4o26ZtnTY6HvJM5aBix4VqR76fh1ftXU',
    range: 'sheet1!A2:C', //Change Sheet1 if your worksheet's name is something else
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [ arrayx ]
    }
  }, (err, response) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    } else {
        console.log("Appended");
    }
  });
}