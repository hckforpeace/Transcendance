
// Problem With the global scope if there is another
// sayHello func in another file it will overwrite this one
// THis is why we need modularity
// in mode we say a file is a module and there is at least one module which is the main module
var sayHello = function(){

}


window.sayHello();
