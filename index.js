require('dotenv').config();

const PORT = 9000;

const { Server } = require('socket.io');
const http = require('http');
const zlib = require('zlib');
const { open } = require('fs/promises');

const httpServer = http.createServer(async (req, res) => {
    const compressionEncodingList = req.headers['accept-encoding'].split(',').map(type => type.trim());
    let encoding = null;
    let transformStream = null;
    if (compressionEncodingList.includes('br')) {
        encoding = 'br';
    } else if (compressionEncodingList.includes('gzip')) {
        encoding = 'gzip';
    }
    if (req.url === '/' && req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        if (encoding === 'gzip') {
            res.setHeader('Content-Encoding', 'gzip');
            res.setHeader('Vary', 'Accept-Encoding');
            transformStream = zlib.createGzip({
                level: 9
            });
        } else if (encoding === 'br') {
            res.setHeader('Content-Encoding', 'br');
            res.setHeader('Vary', 'Accept-Encoding');
            transformStream = zlib.createBrotliCompress({
                params: {
                    [zlib.constants.BROTLI_PARAM_QUALITY]: 11
                }
            });
        }
        res.setHeader('Transfer-Encoding', 'chunked');
        if (transformStream) {
            const fileHandler = await open('./client/client.html');
            const rs = fileHandler.createReadStream();
            rs.pipe(transformStream).pipe(res);
        } else {
            const fileHandler = await open('./client/client.html');
            const rs = fileHandler.createReadStream();
            rs.pipe(res);
        }
    } else if (req.url === '/client.js' && req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/javascript');
        if (encoding === 'gzip') {
            res.setHeader('Content-Encoding', 'gzip');
            res.setHeader('Vary', 'Accept-Encoding');
            transformStream = zlib.createGzip({
                level: 9
            });
        } else if (encoding === 'br') {
            res.setHeader('Content-Encoding', 'br');
            res.setHeader('Vary', 'Accept-Encoding');
            transformStream = zlib.createBrotliCompress({
                params: {
                    [zlib.constants.BROTLI_PARAM_QUALITY]: 11
                }
            });
        }
        res.setHeader('Transfer-Encoding', 'chunked');
        if (transformStream) {
            const fileHandler = await open('./client/client.js');
            const rs = fileHandler.createReadStream();
            rs.pipe(transformStream).pipe(res);
        } else {
            const fileHandler = await open('./client/client.js');
            const rs = fileHandler.createReadStream();
            rs.pipe(res);
        }
    } else if (req.url === '/client.css' && req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/css');
        if (encoding === 'gzip') {
            res.setHeader('Content-Encoding', 'gzip');
            res.setHeader('Vary', 'Accept-Encoding');
            transformStream = zlib.createGzip({
                level: 9
            });
        } else if (encoding === 'br') {
            res.setHeader('Content-Encoding', 'br');
            res.setHeader('Vary', 'Accept-Encoding');
            transformStream = zlib.createBrotliCompress({
                params: {
                    [zlib.constants.BROTLI_PARAM_QUALITY]: 11
                }
            });
        }
        res.setHeader('Transfer-Encoding', 'chunked');
        if (transformStream) {
            const fileHandler = await open('./client/client.css');
            const rs = fileHandler.createReadStream();
            rs.pipe(transformStream).pipe(res);
        } else {
            const fileHandler = await open('./client/client.css');
            const rs = fileHandler.createReadStream();
            rs.pipe(res);
        }
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
