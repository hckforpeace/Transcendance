### Resources:
- [creating a package.json file](https://docs.npmjs.com/creating-a-package-json-file)
### Start a new Node Porject
- `npm init`: will create a Package.json 
	`{
	"name": "obsidian", // current directory name
	"version": "1.0.0", // always `1.0.0`
	"main": "index.js",
	"scripts": {
	"test": "echo \"Error: no test specified\" && exit 1" // by default creates an empty `test` script, you can run in using ``npm run test`` 
	},
	"keywords": [],
	"author": "",
	"license": "ISC",
	"description": ""  // info about the package, or an empty string `""`
	}`
	
- ``npm run:`` Will allow you to run one of your scripts for example ``npm run test``
- ``dependencies:`` the dependencies are part of the package.json, this section will define the external modules that you want to use in your app.
  For example: `nodemon` which will check constantly for new changes in your code, to install it simply
		1. ``npm i nodemon``: this will add to the dependencies nodemon, and also create the directory `/nodemodules` ==That should never be added to your commit !!== 
		2. ``nodemon server.js``: you can add this line to the scripts, with a matching key, assuming that the primary file is server.js
- ``npm install``: lets say you deleted ``node_modules/`` directory, to recreate it and reinstall all your dependencies just type ``npm install``. 