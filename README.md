# Pong game in typescript
## How to test
Build docker image
```bash
docker build -t pong . --progress=plain --no-cache
```
Start docker container
```bash
docker run -d -p 3000:3000 --name pong pong
```
Stop docker container
```bash
docker stop pong
```
Delete container
```bash
docker rm pong
```

## Development
Work in the conf directory
If it is the first time you need to setup the server
### Setting up the server
Install dev dependencies
```bash
npm install -D typescript @type/node
```
Install nodemon
```bash
npm install -g nodemon
```
Install normal dependencies
```bash
npm i
```
### Launching the server
Then you can just launch the server
```bash
npm run start
```
