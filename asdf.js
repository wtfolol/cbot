var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
 
// spreadsheet key is the long id in the sheets URL 
var doc = new GoogleSpreadsheet('<spreadsheet key>');
var sheet;
 
async.series([
  function setAuth(step) {
    // see notes below for authentication instructions! 
    var creds = require('C:\Users\WS\Desktop\cbot/credentials.json');
    doc.useServiceAccountAuth(creds, step);
  },
  function managingSheets(step) {
    doc.addWorksheet({
      title: 'my new sheet'
    }, function(err, sheet) {
 
      // change a sheet's title 
      sheet.setTitle('new title'); //async 
 
      //resize a sheet 
      sheet.resize({rowCount: 50, colCount: 20}); //async 
 
      sheet.setHeaderRow(['name', 'age', 'phone']); //async 
 
      // removing a worksheet 
      sheet.del(); //async 
 
      step();
    });
  }
], function(err){
    if( err ) {
      console.log('Error: '+err);
    }
});