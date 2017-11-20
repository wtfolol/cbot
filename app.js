var builder = require('botbuilder');
var restify = require('restify');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
let authentication = require("./authentication");
var bookingInfo = [];
var submit = [];
var test = [];
var row;

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot and listen to messages
var connector = new builder.ChatConnector({
    appId: '311fc6b0-685b-4fd0-b49e-c77e46008777',
    appPassword: '215tbbjeUvDHK0cP1FFs9px'


});
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send("Hi... I'm the note bot sample. I can create new notes, read saved notes to you and delete notes.");

   // If the object for storing notes in session.userData doesn't exist yet, initialize it
   if (!session.userData.notes) {
       session.userData.notes = {};
       console.log("initializing userData.notes in default message handler");
   }
});

// Add global LUIS recognizer to bot
var luisAppUrl = process.env.LUIS_APP_URL || 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/5cc79349-2318-4b90-a410-9bec5a5c0d58?subscription-key=2544402025834de886a796709461919d&timezoneOffset=0&verbose=true&q=';
bot.recognizer(new builder.LuisRecognizer(luisAppUrl));

// CreateNote dialog
bot.dialog('CreateNote', [
    function (session, args, next) {
        // Resolve and store any Note.Title entity passed from LUIS.
        var intent = args.intent;
        var title = builder.EntityRecognizer.findEntity(intent.entities, 'Note.Title');

        var note = session.dialogData.note = {
          title: title ? title.entity : null,
        };
        
        // Prompt for title
        if (!note.title) {
            builder.Prompts.text(session, 'What would you like to call your note?');
        } else {
            next();
        }
    },
    function (session, results, next) {
        var note = session.dialogData.note;
        if (results.response) {
            note.title = results.response;
        }

        // Prompt for the text of the note
        if (!note.text) {
            builder.Prompts.text(session, 'What would you like to say in your note?');
        } else {
            next();
        }
    },
    function (session, results) {
        var note = session.dialogData.note;
        if (results.response) {
            note.text = results.response;
        }
        
        // If the object for storing notes in session.userData doesn't exist yet, initialize it
        if (!session.userData.notes) {
            session.userData.notes = {};
            console.log("initializing session.userData.notes in CreateNote dialog");
        }
        // Save notes in the notes object
        session.userData.notes[note.title] = note;

        // Send confirmation to user
        session.endDialog('Creating note named "%s" with text "%s"',
            note.title, note.text);
    }
]).triggerAction({ 
    matches: 'Note.Create',
    confirmPrompt: "This will cancel the creation of the note you started. Are you sure?" 
}).cancelAction('cancelCreateNote', "Note canceled.", {
    matches: /^(cancel|nevermind)/i,
    confirmPrompt: "Are you sure?"
});

// Delete note dialog
bot.dialog('DeleteNote', [
    function (session, args, next) {
        if (noteCount(session.userData.notes) > 0) {
            // Resolve and store any Note.Title entity passed from LUIS.
            var title;
            var intent = args.intent;
            var entity = builder.EntityRecognizer.findEntity(intent.entities, 'Note.Title');
            if (entity) {
                // Verify that the title is in our set of notes.
                title = builder.EntityRecognizer.findBestMatch(session.userData.notes, entity.entity);
            }
            
            // Prompt for note name
            if (!title) {
                builder.Prompts.choice(session, 'Which note would you like to delete?', session.userData.notes);
            } else {
                next({ response: title });
            }
        } else {
            session.endDialog("No notes to delete.");
        }
    },
    function (session, results) {
        delete session.userData.notes[results.response.entity];        
        session.endDialog("Deleted the '%s' note.", results.response.entity);
    }
]).triggerAction({
    matches: 'Note.Delete'
}).cancelAction('cancelDeleteNote', "Ok - canceled note deletion.", {
    matches: /^(cancel|nevermind)/i
});

// Helper function to count the number of notes stored in session.userData.notes
function noteCount(notes) {
    
        var i = 0;
        for (var name in notes) {
            i++;
        }
        return i;
    }

    // Read note dialog
bot.dialog('ReadNote', [
    function (session, args, next) {
        if (noteCount(session.userData.notes) > 0) {
           
            // Resolve and store any Note.Title entity passed from LUIS.
            var title;
            var intent = args.intent;
            var entity = builder.EntityRecognizer.findEntity(intent.entities, 'Note.Title');
            if (entity) {
                // Verify it's in our set of notes.
                title = builder.EntityRecognizer.findBestMatch(session.userData.notes, entity.entity);
            }
            
            // Prompt for note name
            if (!title) {
                builder.Prompts.choice(session, 'Which note would you like to read?', session.userData.notes);
            } else {
                next({ response: title });
            }
        } else {
            session.endDialog("No notes to read.");
        }
    },
    function (session, results) {        
        session.endDialog("Here's the '%s' note: '%s'.", results.response.entity, session.userData.notes[results.response.entity].text);
    }
]).triggerAction({
    matches: 'Note.ReadAloud'
}).cancelAction('cancelReadNote', "Ok.", {
    matches: /^(cancel|nevermind)/i
});

bot.dialog('greetings', [
    // Step 1
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    // Step 2
    function (session, results) {
        session.endDialog(`Hello ${results.response}!`);
    }
]).triggerAction({
    matches: 'greetings'
}).cancelAction('cancelReadNote', "Ok.", {
    matches: /^(cancel|nevermind)/i
});

bot.dialog('readbooking', 
    function (session) {
        session.send('read');
        getauth1(session);
    }
).triggerAction({
    matches: 'Read.Ss'
}).cancelAction('cancelReadNote', "Ok.", {
    matches: /^(cancel|nevermind)/i
});

bot.dialog('booking', [
    // Step 1
    function (session) {
        builder.Prompts.text(session, '%s How many people you need to book??');
    },
    // Step 2
    function (session, results) {
        bookingInfo.push(results.response);
        session.send(' %s slot booked',results.response);
        builder.Prompts.text(session, 'Which set meal you wish to book?'); 
    },
    // Step 3
    function (session, results) {
        bookingInfo.push(results.response);
        session.send(' %s set meal booked. ',results.response);
        session.endDialog('Thanks for booking, our staff will contact you as soon as possible.');     
        getauth(session,bookingInfo);
    }
]).triggerAction({
    matches: 'Restaurant.Book'
}).cancelAction('cancelReadNote', "Ok.", {
    matches: /^(cancel|nevermind)/i
});

function getauth(session,submit){
    authentication.authenticate().then((auth)=>{
        appendData(auth,submit);
      });

}

function getauth1(session){
    authentication.authenticate().then((auth)=>{
        updatess(auth,session);
      });
}

function updatess(auth,session) {
    var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
      spreadsheetId: '15M6lPILyUsc4o26ZtnTY6HvJM5aBix4VqR76fh1ftXU',
      range: 'Sheet1!A2:C', //Change Sheet1 if your worksheet's name is something else
    }, (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
      } 
      var rows = response.values;
      if (rows.length == 0) {
        console.log('No data found.');
        session.send('no data found');
      } else {
        for (var i = 0; i < rows.length; i++) {
         row = rows[i];
          test.push(row.join(", ")) ;
          console.log(row.join(", "));
        }
    }
    var string = test.toString();
    session.send('%s',string);
    });
}

function appendData(auth,submit) {
    var sheets = google.sheets('v4');
    var hello = submit;
    sheets.spreadsheets.values.append({
      auth: auth,
      spreadsheetId: '15M6lPILyUsc4o26ZtnTY6HvJM5aBix4VqR76fh1ftXU',
      range: 'sheet1!A2:C', //Change Sheet1 if your worksheet's name is something else
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [ hello ]
      }
    }, (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
      } else {
          console.log("Appended");
      }
    });
}

function myFunc(arg) {
    console.log(`arg was => ${arg}`);
  }