// return value of the function is the object that is the modules object
const logger = require('./logger.js'); // a good practice is to use a constant to never overwrite the logger obj

// logger = 1; => triggers error because its a const

logger.log("hello World");

// console.log(logger);
// displays the functions in logger.js

// console.log(module); => outputs
// DO node app.js
//  node {
//   id: '.',
//   path: '/home/pierre/Documents/introToNode/ex04',
//   exports: {},
//   filename: '/home/pierre/Documents/introToNode/ex04/app.js',
//   loaded: false,
//   children: [],
//   paths: [
//     '/home/pierre/Documents/introToNode/ex04/node_modules',
//     '/home/pierre/Documents/introToNode/node_modules',
//     '/home/pierre/Documents/node_modules',
//     '/home/pierre/node_modules',
//     '/home/node_modules',
//     '/node_modules'
//   ],
//   [Symbol(kIsMainSymbol)]: true,
//   [Symbol(kIsCachedByESMLoader)]: false,
//   [Symbol(kIsExecuting)]: true
// }
