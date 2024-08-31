const PORT = 9000;

const { Server } = require('socket.io');
const http = require('http');
const { open } = require('fs/promises');

const httpServer = http.createServer(async (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Transfer-Encoding', 'chunked');
        const fileHandler = await open('./client/client.html');
        const rs = fileHandler.createReadStream();
        rs.pipe(res);
    } else if (req.url === '/client.js' && req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/javascript');
        res.setHeader('Transfer-Encoding', 'chunked');
        const fileHandler = await open('./client/client.js');
        const rs = fileHandler.createReadStream();
        rs.pipe(res);
    } else if (req.url === '/client.css' && req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Transfer-Encoding', 'chunked');
        const fileHandler = await open('./client/client.css');
        const rs = fileHandler.createReadStream();
        rs.pipe(res);
    }
});
const io = new Server(httpServer);

let client1 = null;
let client2 = null;

io.on('connection', socket => {
    if (client1 === null) {
        client1 = socket;
        socket.on('iceCandidate', (data) => {
            client2 && client2.emit('iceCandidate', data);
        });

        socket.on('offer', (data) => {
            client2 && client2.emit('offer', data);
        });

        socket.on('answer', async (data) => {
            client2 && client2.emit('answer', data);
        });
    } else if (client2 === null) {
        client2 = socket;
        socket.on('iceCandidate', (data) => {
            client1 && client1.emit('iceCandidate', data);
        });

        socket.on('offer', (data) => {
            client1 && client1.emit('offer', data);
        });

        socket.on('answer', async (data) => {
            client1 && client1.emit('answer', data);
        });
    }

    socket.on('call-hang-up', () => {
        client1 && client2 && io.emit('call-hang-up');
    });

    socket.on('call-set-up', () => {
        client1 && client2 && io.emit('call-set-up');
    });

    socket.on('logout', () => {
        io.emit('logout');
        client1 = null;
        client2 = null;
    });
});

httpServer.listen(PORT, () => {
    console.log('signal server up ...');
})
