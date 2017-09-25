var fs = require('fs');
var msg = require('./text.js');



console.log(msg);
setTimeout(myFunc, 15000, 'funky');



function myFunc(arg) {
    console.log(`arg was => ${arg}`);
  }
  