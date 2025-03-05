const http = require('http');
const app = require('./app');
const port = 3000;
const server = http.createServer(app);

server.listen(3000, () => {
    console.log('App is running on port '+port);
});