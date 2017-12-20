var builder = require('botbuilder');
var restify = require('restify');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
let authentication = require("./authentication");
var msg = require("./Message.js")
var bookingInfo = [];
var submit = [];
var test = [];
var row;

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create connector and listen for messages
var connector = new builder.ChatConnector({
    appId: '311fc6b0-685b-4fd0-b49e-c77e46008777',
    appPassword: '215tbbjeUvDHK0cP1FFs9px'
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send("Hi... I'm the robot for restaurant, You can chat with me to get information of the restaurant.");
});

// Add global LUIS recognizer to bot
var luisAppUrl = process.env.LUIS_APP_URL || 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/5cc79349-2318-4b90-a410-9bec5a5c0d58?subscription-key=2544402025834de886a796709461919d&timezoneOffset=0&verbose=true&q=';
bot.recognizer(new builder.LuisRecognizer(luisAppUrl));

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
    session.send('read  %s',msg);
}
).triggerAction({
matches: 'Read.Ss'
}).cancelAction('cancelReadNote', "Ok.", {
matches: /^(cancel|nevermind)/i
});

bot.dialog('booking', [
    
    // Step 1
    function (session) {
        bookingInfo.push(session.message.user.name);
        builder.Prompts.text(session, ' How many people you need to book??');
    },
    // Step 2
    function (session, results) {
        var slot = builder.EntityRecognizer.parseNumber(results.response); 
        if(!isNaN(slot)){
            bookingInfo.push(slot);
        session.send('%s slot booked.',slot);
        builder.Prompts.text(session, 'Which set meal you wish to book?'); 
        }
        else{
        session.endDialog("Not a number enter, please retry.");
        }
    },
    // Step 3
    function (session, results) {
        bookingInfo.push(results.response);
        session.send(' %s set meal booked. ',results.response);
        builder.Prompts.text(session,'What is the date that you wish to book?');     
    },
    //step 4
    function (session, results) {
        bookingInfo.push(results.response);
        session.send(' Successfully booked! ');
        session.endDialog('Thanks for booking, our staff will contact you as soon as possible.');    
        getauth(session,bookingInfo);
        }
]).triggerAction({
    matches: 'Restaurant.Book'
}).cancelAction('cancelReadNote', "Ok.", {
    matches: /^(cancel|nevermind)/i
});

bot.dialog('NewProduct', [
    function (session) {
        builder.Prompts.text(session, ' Do you wish to check on our new item?(y/n) ');
    },
    function (session) {
        var ans = "y";
        var strNI = "results.response";
        if(strNI.toLowerCase() === strNI){
        var cards = getCardsAttachments();
    
        // create reply with Carousel AttachmentLayout
        var reply = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(cards);
    
        session.send(reply);
        }
        else
        session.endDialog("ended");
    }
]).triggerAction({
    matches: 'New.Product'
}).cancelAction('cancelReadNote', "Ok.", {
    matches: /^(cancel|nevermind)/i
});

bot.dialog('Recommendation', [
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
    matches: 'Recommend.Specialty'
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
        session.send('authen');
      });
}


function updatess(auth,session) {
    var s ;
    session.send('upatess')
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
          console.log(row);
          s = test.toString();
          session.send('%s ', s);
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

function getCardsAttachments(session) {
    return [
        new builder.HeroCard(session)
            .title('Azure Storage')
            .subtitle('Offload the heavy lifting of data center management')
            .text('Store and help protect your data. Get durable, highly available data storage across the globe and pay only for what you use.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/storage/media/storage-introduction/storage-concepts.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/storage/', 'Learn More')
            ]),

        new builder.ThumbnailCard(session)
            .title('DocumentDB')
            .subtitle('Blazing fast, planet-scale NoSQL')
            .text('NoSQL service for highly available, globally distributed apps—take full advantage of SQL and JavaScript over document and key-value data without the hassles of on-premises or virtual machine-based cloud database options.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/documentdb/media/documentdb-introduction/json-database-resources1.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/documentdb/', 'Learn More')
            ]),

        new builder.HeroCard(session)
            .title('Azure Functions')
            .subtitle('Process events with a serverless code architecture')
            .text('An event-based serverless compute experience to accelerate your development. It can scale based on demand and you pay only for the resources you consume.')
            .images([
                builder.CardImage.create(session, 'https://azurecomcdn.azureedge.net/cvt-5daae9212bb433ad0510fbfbff44121ac7c759adc284d7a43d60dbbf2358a07a/images/page/services/functions/01-develop.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/functions/', 'Learn More')
            ]),

        new builder.ThumbnailCard(session)
            .title('Cognitive Services')
            .subtitle('Build powerful intelligence into your applications to enable natural and contextual interactions')
            .text('Enable natural and contextual interaction with tools that augment users\' experiences using the power of machine-based intelligence. Tap into an ever-growing collection of powerful artificial intelligence algorithms for vision, speech, language, and knowledge.')
            .images([
                builder.CardImage.create(session, 'https://azurecomcdn.azureedge.net/cvt-68b530dac63f0ccae8466a2610289af04bdc67ee0bfbc2d5e526b8efd10af05a/images/page/services/cognitive-services/cognitive-services.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/cognitive-services/', 'Learn More')
            ])
    ];
}


process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
  });
  
  setTimeout(function () {
    console.log('This will still run.');
  }, 5000);

function myFunc(arg) {
    console.log(`arg was => ${arg}`);
  }