window.$ = window.jQuery = require("./jquery.js");

const { ipcRenderer, remote } = require('electron')

var httpPort = 80;
var fxPort = 6666;
var executePath = "C:\\Users\\xianfei\\source\\repos\\fxDrawer-demo-mahjong\\Debug\\fxDrawer-demo-mahjong.exe";
var pwd = "C:\\Users\\xianfei\\source\\repos\\fxDrawer-demo-mahjong\\fxDrawer-demo-mahjong\\";
var executeArgs = ['']

const WebSocket = require('ws');
const wss = new WebSocket.Server({ noServer: true });

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
var sockets = net.createServer(async function (sock) {
  // 获取连接到的pid
  // 推入到 pid-socket对应表
  var ws = null
  var pid;

  sock.on('data', function (data) {
    const obj = JSON.parse(data.subarray(2).toString());
    switch (obj.action) {
      case 'init':
        pidSocketMap.set(parseInt(obj.pid), sock);
        pid = obj.pid;
        if (ws == null) ws = pidWsMap.get(parseInt(pid));
      // if (obj.hasOwnProperty('pwd')) pwd = obj.pwd;
      // loginfo(pid)
      default:
        // loginfo(obj)
        // loginfo(pwd)

        if (obj.hasOwnProperty('path')) obj.path = '/fxPath' + (process.platform === "win32" ? '/' : '') + Path.resolve(pwd, obj.path).replaceAll('\\', '/')
        ws.send(JSON.stringify(obj))
    }
  })

  sock.on('close', function () {
    loginfo('socket close, pid:' + parseInt(pid));
    pidWsMap.set(parseInt(pid), null)
    pidSocketMap.set(parseInt(pid), null)
    ws.send('{"action": "exit"}');
    try {
      $('#pid'+pid).remove();
      process.kill(pid);
    } catch (e) {
    }
  });

  sock.on('error', function () {
  })

});

// 处理WebSocket
wss.on('connection', function (ws, req) {
  // 创建新的本地应用并获取pid

  var childProcess = cp.execFile(executePath.replaceAll('\\', '/'),executeArgs);
  childProcess.stdout.on('data', function (data) {
    logstdout(childProcess.pid, data.toString())
    //console.log(data.toString()); 
  });
  childProcess.stderr.on('data', function (data) {
    logstderr(childProcess.pid, data.toString())
    //console.log(data.toString()); 
  });
  var pid = childProcess.pid
  var ip = req.socket.remoteAddress.replaceAll('::ffff:','')
  loginfo('新客户端：' + ip + ' pid:' + pid)
  $('#clientlist').append(`<div id="pid${pid}" class="card mdui-shadow-3">&nbsp;&nbsp;ip:${ip}&nbsp;&nbsp;pid:${pid}</div>`)
  // 推入到pid-ws对应表

  pidWsMap.set(parseInt(pid), ws)
  // loginfo(pid)
  // loginfo('client connected');
  ws.on('message', function (message) {
    // loginfo(message);
    pidSocketMap.get(parseInt(pid)).write('00ok' + message);
  });

  ws.on('close', function () {
    loginfo('ws close, client:' + req.socket.remoteAddress);
    pidWsMap.set(parseInt(pid), null)
    pidSocketMap.set(parseInt(pid), null)
    try {
      $('#pid'+pid).remove();
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
  if (req.url === '/') fileName = Path.resolve(__dirname, "./fxdweb-index.html");
  const extName = Path.extname(fileName).substr(1);
  try {
    if (fs.existsSync(fileName)) { //判断本地文件是否存在
      var mineTypeMap = {
        html: 'text/html;charset=utf-8',
        png: "image/png",
        jpg: "image/jpeg",
        ico: "image/x-icon",
        jpeg: "image/jpeg",
        gif: "image/gif",
        css: "text/css;charset=utf-8",
        txt: "text/plain;charset=utf-8",
        mp3: "audio/mpeg",
        mp4: "video/mp4",
        ttf: "font/ttf",
        woff: "font/woff",
        woff2: "font/woff2",
        js: "application/x-javascript",
        map: "application/json"
      }
      if (mineTypeMap[extName]) {
        res.setHeader('Content-Type', mineTypeMap[extName]);
      } else {
        throw 'File access denied for security reasons.';
      }
      var stream = fs.createReadStream(fileName);
      stream.pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Error: 404 Not Found.\n\nfxDrawer web server by xianfei');
    }
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
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




window.onload = function () {
  // 初始化标题栏按钮
  if (process.platform !== 'darwin') {
    document.getElementById('btns').innerHTML = String.raw`<button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 5px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="remote.getCurrentWindow().close()" title="close"><i class="mdui-icon material-icons" style="font-size: 20px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">close</i></button>
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 40px;top: 0;-webkit-app-region: no-drag;z-index: 11;" id="minbtn"
      onclick="remote.getCurrentWindow().minimize()" style="font-size: small;"><font style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">—</font></button>
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;left: 5px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="ipcRenderer.send('showdoc', '')" title="Show Document"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">help_outline</i></button>
      `
  } else {
    document.getElementById('btns').innerHTML = String.raw`
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 5px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="ipcRenderer.send('showdoc', '')" title="Show Document"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">help_outline</i></button>
      `
  }

  // remote.getCurrentWindow().toggleDevTools();

  // 用于和主进程进行交互
  ipcRenderer.on('connect-broke', async function (event, ...args) {
    document.getElementById('connectbroke').innerText = ' 连接已断开'
  })

  ipcRenderer.on('toggle-devtools', function (event, ...args) {

  })






}

function loginfo(info) {
  $('#log').append('<span style="color:rgb(50, 216, 0)">[ INFO ]&nbsp;&nbsp;' + info + '</span><br>')
  var ele = document.getElementById('bottom');
  ele.scrollTop = ele.scrollHeight;
}

function logstdout(pid, info) {
  $('#log').append('<span style="color:#666">[ STDOUT PID:' + pid + ']&nbsp;&nbsp;' + info.replaceAll('\n', '<br>') + '</span><br>')
  var ele = document.getElementById('bottom');
  ele.scrollTop = ele.scrollHeight;
}

function logstderr(pid, info) {
  $('#log').append('<span style="color:#f00">[ STDERR PID:' + pid + ']&nbsp;&nbsp;' + info.replaceAll('\n', '<br>') + '</span><br>')
  var ele = document.getElementById('bottom');
  ele.scrollTop = ele.scrollHeight;
}

function logerror(info) {
  $('#log').append('<span style="color:#f00">[ ERROR ]&nbsp;&nbsp;' + info + '</span><br>')
  var ele = document.getElementById('bottom');
  ele.scrollTop = ele.scrollHeight;
}

function chooseExec() {
  $('#execpath').val(remote.dialog.showOpenDialogSync().toString());
}

function choosePath() {
  $('#path').val(remote.dialog.showOpenDialogSync({ properties: ['openDirectory'] }).toString());
}
var os = require('os');
var ifaces = os.networkInterfaces();

function startServ(btn) {
  if ($(btn).text() == "启动服务") {
    executePath = $('#execpath').val();
    pwd = $('#path').val();
    httpPort = parseInt($('#httpport').val());
    fxPort = parseInt($('#fxdport').val());
    try {
      executeArgs = JSON.parse($('#args').val());
      server.listen(httpPort);
      sockets.listen(fxPort);
    } catch (err) {
      logerror(err.toString());
      return
    }
    loginfo('服务已启动，本机IP信息如下：');
    Object.keys(ifaces).forEach(function (ifname) {
      var alias = 0;
    
      ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }
    
        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          loginfo(ifname + ':' + alias + '&nbsp;&nbsp;&nbsp;'+ iface.address);
        } else {
          // this interface has only one ipv4 adress
          loginfo(ifname + '&nbsp;&nbsp;&nbsp;' + iface.address);
        }
        ++alias;
      });
    });
    $('#connectbroke').text('服务已启动')
    $('#connectbroke').css('color', 'rgb(50, 216, 0)')
    $(btn).text('暂停服务')
  } else {


    logerror('当前版本暂时不支持暂停,请直接关闭程序');
    return;

    $('#connectbroke').text('服务已暂停')
    $('#connectbroke').css('color', 'rgb(253, 168, 10)')
    $(btn).text('启动服务')
  }
}