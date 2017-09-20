let google = require('googleapis');
let authentication = require("./authentication.js");

function getData(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: '15M6lPILyUsc4o26ZtnTY6HvJM5aBix4VqR76fh1ftXU',
    range: 'Sheet1!A2:C', //Change Sheet1 if your worksheet's name is something else
  }, (err, response) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    } 
    var rows = response.values;
    if (rows.length === 0) {
      console.log('No data found.');
    } else {
      for (var i = 0; i &lt; rows.length; i++) {
        var row = rows[i];
        console.log(row.join(", "));
      }
    }
  });
}

authentication.authenticate().then((auth)=>{
    getData(auth);
});
