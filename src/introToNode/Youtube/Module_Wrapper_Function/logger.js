// this is the wrapper module function all modules are wrapped in it 
// (function (exports, require, module, __filename, __dirname) {  
//        
//     
//  });
// var x =;
console.log(__filename);
console.log(__dirname);

var url = 'http://mylogger.io/log';

function log(message) {
  // Send http request
  console.log(message);
}


// add a method log to the export object that we set to the function log
// it makes the function available outside the scope of the file 
module.exports = log; // NOTE if func not added to global it cannot be used by a require

// module.exports = log // initially exports was an empty obj and now it's redefined as a function
// which means in app.js you would do:
// const log = require('./logger.js')
// log('hello world')
