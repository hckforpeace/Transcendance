## Source
[typescript doc](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)
## A Static Type Checker

We said earlier that some languages wouldn’t allow those buggy programs to run at all. Detecting errors in code without running it is referred to as _static checking_. Determining what’s an error and what’s not based on the kinds of values being operated on is known as static _type_ checking.
TypeScript checks a program for errors before execution, and does so based on the _kinds of values_, making it a _static type checker_.

### Syntax
TypeScript is a language that is a _superset_ of JavaScript: JS syntax is therefore legal TS.


### Install Typescript
`npm i -g typescript`: This will install typescript and also the CLI ==tsc==

### Create a the config file for TS
``tsc --init``: Will create the file tscconfig.json
#### Interesting Parameters:
-     **"rootDir"**: "relative path",    **/* Specify the root folder within your source files. */**
-     **"outDir"**: "relative path",       **/* Specify an output folder for all emitted files. */**



### Compile a .ts file into a .js
`tsc filename.ts`: will give you **filename.js**
`tsc`: Will compile all the file in the directory specified in the parameter **rootDir**, of the **package.json**  and out the .js in the **outDir** path.
