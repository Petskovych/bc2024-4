const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const commander = require('commander');

commander
    .option('-h, --host <host>', 'адреса сервера', 'localhost')
    .option('-p, --port <port>', 'порт сервера', '3000')
    .option('-c, --cache <cache>', 'шлях до кешу', './cache')
    .parse(process.argv);

const { host, port, cache } = commander;

fs.mkdir(cache, { recursive: true }).catch(console.error);

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
});

server.listen(port, host, () => {
    console.log(`Сервер запущено на http://${host}:${port}`);
});
