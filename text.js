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
