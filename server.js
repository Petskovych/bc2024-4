const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { Command } = require('commander');

const program = new Command();

program
    .option('-h, --host <host>', 'адреса сервера', 'localhost')
    .option('-p, --port <port>', 'порт сервера', '3000')
    .option('-c, --cache <cache>', 'шлях до кешу', './cache')
    .parse(process.argv);

const { host, port, cache } = program.opts();

if (!host || !port || !cache) {
    console.error('Всі параметри -h, -p, -c є обовʼязковими!');
    process.exit(1);
}

fs.mkdir(cache, { recursive: true }).catch(console.error);

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const code = req.url.slice(1);

    if (req.method === 'GET') {
        try {
            const data = await fs.readFile(path.join(cache, `${code}.jpg`));
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(data);
        } catch (error) {
            try {
                const superagent = require('superagent');
                const response = await superagent.get(`https://http.cat/${code}`);
                await fs.writeFile(path.join(cache, `${code}.jpg`), response.body);
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                res.end(response.body);
            } catch (err) {
                res.writeHead(404, 'Not Found');
                res.end('Not Found');
            }
        }
    } else if (req.method === 'PUT') {
        const data = [];
        req.on('data', chunk => data.push(chunk));
        req.on('end', async () => {
            try {
                await fs.writeFile(path.join(cache, `${code}.jpg`), Buffer.concat(data));
                res.writeHead(201, 'Created');
                res.end('Created');
            } catch (error) {
                res.writeHead(500, 'Internal Server Error');
                res.end('Internal Server Error');
            }
        });
    } else if (req.method === 'DELETE') {
        try {
            await fs.unlink(path.join(cache, `${code}.jpg`));
            res.writeHead(200, 'OK');
            res.end('Deleted');
        } catch (error) {
            res.writeHead(404, 'Not Found');
            res.end('Not Found');
        }
    } else {
        res.writeHead(405, 'Method Not Allowed');
        res.end('Method Not Allowed');
    }
});

server.listen(port, host, () => {
    console.log(`Сервер запущено на http://${host}:${port}`);
});
