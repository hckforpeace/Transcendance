import http from 'http';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';

const PORT = 3000;
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename, __dirname);

const server = http.createServer((req, res) => {
    // res.write('Hello World'); // not mandatory you can write in end params
    // res.setHeader('Content-Type', 'text/html');
    // res.statusCode = 404;
    // res.end('<h1> hello world </h1>'); // with express you dont need to end the stream

    //          status code and header params
    
    // console.log(req.url);
    // console.log(req.method);

    try{
        //check if GET request
        if (req.method == 'GET')
        {
            let  filePath;
            if (req.url == '/')
            {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('<h1> Home page </h1>');
            }
            else if (req.url == '/about')
            {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('<h1> about </h1>');
            }
            else
            {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1> Not Found </h1>');
            }
        }
        else 
        {
            throw new Error('Method not allowed');
        }
    }
    catch (error)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
    }
});

server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})