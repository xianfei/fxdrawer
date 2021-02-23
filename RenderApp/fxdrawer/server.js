var httpPort = 80;
var fxPort = 6666;
var executePath = "C:\\Users\\xianfei\\source\\repos\\fxDrawer-demo-mahjong\\Debug\\fxDrawer-demo-mahjong.exe";
var executeArgs = ['']

const WebSocket = require('ws');
const wss = new WebSocket.Server({noServer: true});

var net = require('net');
var cp = require('child_process');

const http = require("http");
const url = require('url');
const Path = require("path");
const fs = require("fs");

// fxdrawer web server 
// 一个ws对应一个pid 一个pid对应一个socket

// pid-socket map
var pidSocketMap = new Map();

// pid-ws map
var pidWsMap = new Map();


// 与本地应用交换数据
net.createServer(async function (sock) {
    // 获取连接到的pid
    // 推入到 pid-socket对应表
    var ws = null
    var pid;
    var pwd="C:\\Users\\xianfei\\source\\repos\\fxDrawer-demo-mahjong\\fxDrawer-demo-mahjong\\";
    sock.on('data', function (data) {
        const obj = JSON.parse(data.subarray(2).toString());
        switch (obj.action) {
            case 'init':
                pidSocketMap.set(parseInt(obj.pid), sock);
                pid = obj.pid;
                if (ws == null) ws = pidWsMap.get(parseInt(pid));
                // if (obj.hasOwnProperty('pwd')) pwd = obj.pwd;
            // console.log(pid)
            default:
                // console.log(obj)
                // console.log(pwd)

                if (obj.hasOwnProperty('path')) obj.path = '/fxPath'+(process.platform==="win32"?'/':'')+Path.resolve(pwd, obj.path).replaceAll('\\','/')
                ws.send(JSON.stringify(obj))
        }
    })

    sock.on('close', function () {
        console.log('socket close');
        ws.send('{"action": "exit"}');
        try {
            process.kill(pid);
        } catch (e) {
        }
    });

    sock.on('error', function () {
    })

}).listen(fxPort);

// 处理WebSocket
wss.on('connection', function (ws) {
    // 创建新的本地应用并获取pid
    var childProcess = cp.execFile(executePath.replaceAll('\\','/'), executeArgs, (err, stdout, stderr) => {
        console.log(stdout)
    });
    // 推入到pid-ws对应表
    var pid = childProcess.pid
    pidWsMap.set(parseInt(pid), ws)
    // console.log(pid)
    // console.log('client connected');
    ws.on('message', function (message) {
        // console.log(message);
        pidSocketMap.get(parseInt(pid)).write('00ok' + message);
    });

    ws.on('close', function () {
        console.log('ws close');
        try {
            process.kill(pid);
        } catch (e) {
        }
    });

    ws.on('error', function () {
    })
});

// 处理静态资源 http server
var server = http.createServer(function (req, res) {
    if (req.url.substr(0, 7) === '/fxPath') // 虚拟路径for读取本地文件
        var fileName = req.url.substr(8)
    else var fileName = Path.resolve(__dirname, "." + req.url);
    // 如果返回根目录则默认为index.html
    if (req.url === '/') fileName = Path.resolve(__dirname, "./index.html");
    const extName = Path.extname(fileName).substr(1);
    try {
        if (fs.existsSync(fileName)) { //判断本地文件是否存在
            var mineTypeMap = {
                html: 'text/html;charset=utf-8',
                png: "image/png",
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
                gif: "image/gif",
                css: "text/css;charset=utf-8",
                txt: "text/plain;charset=utf-8",
                mp3: "audio/mpeg",
                mp4: "video/mp4",
                ttf: "font/ttf",
                woff: "font/woff",
                woff2: "font/woff2",
                js: "application/x-javascript"
            }
            if (mineTypeMap[extName]) {
                res.setHeader('Content-Type', mineTypeMap[extName]);
            } else {
                throw 'File access denied for security reasons.';
            }
            var stream = fs.createReadStream(fileName);
            stream.pipe(res);
        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Error: 404 Not Found.\n\nfxDrawer web server by xianfei');
        }
    } catch (e) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Error: 500 Internal Server Error.\n' +
            'Exception: ' + e + '\n\nfxDrawer web server by xianfei');
    }
})

server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;

    if (pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

server.listen(httpPort);