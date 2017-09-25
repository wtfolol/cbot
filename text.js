      var fs = require('fs');

 // Load client secrets from a local file.
    fs.readFile('./client_secret.json', function(err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        setTimeout(myFunc, 15000, 'funky');
      }
      // Authorize a client with the loaded credentials, then call the
      // Google Sheets API.
      else{
      var message = content;
      console.log(content);
      setTimeout(myFunc, 15000, 'funky');
      }
    })
    
    
    
    function myFunc(arg) {
        console.log(`arg was => ${arg}`);
      }
    