// Modules to control application life and create native browser window
const { app, BrowserWindow, TouchBar, ipcMain, dialog } = require('electron')
const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar
var net = require('net');
var cp = require('child_process');
// fxDrawer与适配器交互监听
var HOST = '127.0.0.1';
var PORT = 6666;

// 是否监听局域网（true=>绑定127.0.0.1 false=>绑定0.0.0.0）
var localOnly = true;
const versionInfo = '0.1.1';
const Path = require("path");

const isMac = process.platform === 'darwin'

const find = require('find-process');

// 用于共享argv参数变量
global.sharedObject = { prop1: process.argv }

app.whenReady().then(fxStart)

ipcMain.on('showdoc', (event, arg) => {
    showDoc()
})

ipcMain.on('showwebserv', (event, arg) => {
    showServ()
})

// 程序入口
function fxStart() {
    //console.log(process.argv)
    // 读取传入启动参数argv
    for (let index = 0; index < process.argv.length; index++) {
        if (process.argv[index] === 'execute') {
            index++;
            cp.exec(process.argv[index++], (err, stdout, stderr) => { console.log(stdout) });
            continue;
        } else if (process.argv[index] === 'listen') {
            index++;
            PORT = parseInt(process.argv[index++]);
            netParser();
            continue;
        } else if (process.argv[index] === 'showdoc') {
            showDoc();
            return;
        } else if (process.argv[index] === 'server') {
            showServ();
            return;
        } else if (process.argv[index] === 'help' || process.argv[index] === '-h' || process.argv[index] === '-help') {
            console.log('fxDrawer ' + versionInfo + '\n')
            console.log('Usage: fxdrawer [listen <listenPort>] [showdoc] [listen-ethernet]\n')
            console.log('   listen <listenPort> : listen TCP on <listenPort>, local only by default.')
            console.log('   showdoc : show the document.')
            console.log('   server : show fxDrawer web server controller.')
            console.log('   listen-ethernet : listen TCP request on Ethernet.')
            app.quit();
            return;
        } else if (process.argv[index] === 'listen-ethernet') {
            localOnly = false;
            continue;
        }
    }
    // 打开初始化页面  用于配置path等
    if (process.argv.length > 1) return;
    var helloWindow;
    if (isMac) helloWindow = new BrowserWindow({
        width: 700,
        height: 450,
        titleBarStyle: 'hidden',
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    else
        helloWindow = new BrowserWindow({
            width: 700,
            height: 450,
            frame: false,
            webPreferences: {
                enableRemoteModule: true,
                nodeIntegration: true,
                contextIsolation: false,
            }
        })
    helloWindow.loadFile('welcome.html')
    // helloWindow.toggleDevTools();
}


// TCP监听及数据处理
async function netParser() {
    await new Promise(function (resolve) {
        find('port', PORT)
            .then(function (list) {
                if (list.length == 0) resolve();
                else {
                    if (list[0].name.indexOf('fxdrawer') != -1) { app.quit(); }
                    else resolve();
                }
            });
    });
    try {
        let tcpConnect = net.createServer(function (sock) {
            var killpid = -1; // 关闭窗口后杀死被调用进程
            var closeOnBroke = false; // 断开连接后关闭窗口
            var mainWindow;
            var pwd = '';
            // 我们获得一个连接 - 该连接自动关联一个socket对象
            // console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

            // 为这个socket实例添加一个"data"事件处理函数
            sock.on('data', function (data) {
                // console.log('DATA ' + sock.remoteAddress + ': ' + data.subarray(2).toString('utf8'));
                const obj = JSON.parse(data.subarray(2).toString());
                switch (obj.action) {
                    case 'init':
                        mainWindow = createWindow(obj.width, obj.height + 30);
                        if (obj.hasOwnProperty('killwhenclose')) killpid = obj.pid;
                        if (obj.hasOwnProperty('closeOnBroke')) closeOnBroke = true;
                        if (obj.hasOwnProperty('pwd')) pwd = obj.pwd;

                        // 关闭窗口后杀死被调用进程
                        mainWindow.on('close', function () { if (killpid != -1) try { process.kill(killpid); } catch (err) { } });
                        // 等待窗口加载完成
                        mainWindow.webContents.once('did-finish-load', function () { sock.write('00ok'); });
                        break;
                    case 'exit':
                        app.quit()
                        break;
                    default:
                        // 发送给窗口
                        if (obj.hasOwnProperty('path')) {
                            var p = Path.resolve(pwd, obj.path).replaceAll('\\', '/')
                            obj.path = 'file://' + (process.platform === "win32" ? '/' : '') + p
                        }
                        mainWindow.webContents.send('opt-request', JSON.stringify(obj))
                        // 等待事件结束
                        // 由窗口放回数据
                        ipcMain.once('opt-reply-' + mainWindow.id, function (event, optRet) {
                            sock.write('00ok' + optRet);
                        })
                }
            });

            // 为这个socket实例添加一个"close"事件处理函数
            sock.on('close', function () {
                // console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
                // mainWindow.close()
                try {
                    killpid = -1;
                    if (closeOnBroke) mainWindow.close()
                    else mainWindow.webContents.send('connect-broke', '')
                } catch (err) {

                }
            });

            sock.on('error', function (err) {
                // mainWindow.close()
                if (err.code == 'ECONNRESET')
                    try {
                        killpid = -1;
                        if (closeOnBroke) mainWindow.close()
                        else mainWindow.webContents.send('connect-broke', '')
                    } catch (err) {

                    }
            });

        });
        if (localOnly) tcpConnect.listen(PORT, HOST);
        else tcpConnect.listen(PORT);

        tcpConnect.on('error', function (err) {
            if (err.code == 'EADDRINUSE') {
                find('port', PORT)
                    .then(function (list) {
                        if (list[0].name.indexOf('fxdrawer') == -1) {
                            if (!list.length) {
                                dialog.showErrorBox('TCP监听错误', '端口被占用？但未找到使用端口' + PORT + '的程序')
                            } else {
                                dialog.showErrorBox('TCP监听错误', '端口' + PORT + '被程序 ' + list[0].name + ' 占用，您可以在任务管理器中杀死它！')
                                // console.log();
                            }
                        }
                        app.quit()
                    })


            }
        });
    } catch (err) {
        console.log(err.message)
    }

}

function showServ() {
    var servWindow;
    if (isMac) servWindow = new BrowserWindow({
        width: 900,
        height: 600,
        titleBarStyle: 'hidden',
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    else
        servWindow = new BrowserWindow({
            width: 900,
            height: 600,
            frame: false,
            webPreferences: {
                enableRemoteModule: true,
                nodeIntegration: true,
                contextIsolation: false,
            }
        })

    // and load the html of the app.
    servWindow.loadFile('fxdserv.html')

    if (!isMac) return
    // 设置touchbar on macos
    servWindow.setTouchBar(new TouchBar({
        items: [
            // new TouchBarButton({
            //     label: '👌 Got it and Close',
            //     backgroundColor: '#22644d',
            //     click: () => {
            //         servWindow.close();
            //     }
            // }),
            new TouchBarLabel({ label: "fxDrawer Web Server Beta by xianfei" })
        ]
    }))
}

function showDoc() {
    var docWindow;
    if (isMac) docWindow = new BrowserWindow({
        width: 1200,
        height: 700,
        titleBarStyle: 'hidden',
        transparent: true,
        vibrancy: 'popover',
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    else{
        // !important   is maybe not suit for linux
        docWindow = new BrowserWindow({
            width: 1200,
            height: 700,
            frame: false,
            transparent: true,
            webPreferences: {
                enableRemoteModule: true,
                nodeIntegration: true,
                contextIsolation: false,
            }
        })

        docWindow.on('ready-to-show',function() {
            var electronVibrancy = require('windows10-electron-vibrancy');
            
            electronVibrancy.setVibrancy(docWindow)
          
            docWindow.show();
          });
    }
    // and load the html of the app.
    docWindow.loadFile('readme.html')

    // docWindow.toggleDevTools();

    if (!isMac) return
    // 设置touchbar on macos
    docWindow.setTouchBar(new TouchBar({
        items: [
            new TouchBarButton({
                label: '👌 Got it and Close',
                backgroundColor: '#22644d',
                click: () => {
                    docWindow.close();
                }
            }),
            new TouchBarLabel({ label: "fxDrawer by xianfei HTML5 Electron 技术预览版" })
        ]
    }))
}

function createWindow(w, h) {
    // Create the browser window.
    var mainWindow;
    if (isMac) mainWindow = new BrowserWindow({
        width: w,
        height: h,
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    else mainWindow = new BrowserWindow({
        width: w,
        height: h,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })

    // and load the html of the app.
    mainWindow.loadFile('fxdapp.html')

    // 设置menu菜单

    var template
    if (isMac) template = [
        {
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'DevTools',
            submenu: [
                {
                    label: 'ToggleDevTools',
                    click: () => { mainWindow.webContents.send('toggle-devtools', '') }
                }
            ]
        }, {
            label: 'Help',
            submenu: [
                {
                    label: 'ShowDoc',
                    click: showDoc
                }
            ]
        }
    ]; else template = [
        {
            label: 'DevTools',
            click: () => { mainWindow.webContents.send('toggle-devtools', '') }
        }, {
            label: 'ShowDoc',
            click: showDoc
        }
    ]
    const { Menu } = require('electron');
    let menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    // TouchBar API only works on macOS devices with a TouchBar.
    if (process.platform !== 'darwin') return mainWindow;

    // 附赠彩蛋：老虎机

    let spinning = false

    // Reel labels
    const reel1 = new TouchBarLabel({ label: '<- Easter egg!🌟' })
    const reel2 = new TouchBarLabel({ label: "fxDrawer by xianfei" })
    const reel3 = new TouchBarLabel()

    // Spin result label
    const result = new TouchBarLabel()

    // Spin button
    const spin = new TouchBarButton({
        label: '🎰 Spin',
        backgroundColor: '#4d386e',
        click: () => {
            if (spinning) return // Ignore clicks if already spinning
            spinning = true
            result.label = ''
            let timeout = 10
            const spinLength = 4 * 1000 // 4 seconds
            const startTime = Date.now()
            const spinReels = () => {
                updateReels()
                if ((Date.now() - startTime) >= spinLength) {
                    finishSpin()
                } else {
                    timeout *= 1.1  // Slow down a bit on each spin
                    setTimeout(spinReels, timeout)
                }
            }
            spinReels()
        }
    })

    const getRandomValue = () => {
        const values = ['🍒', '💎', '🍭', '🍊', '🔔', '⭐', '🍇', '🍀']
        return values[Math.floor(Math.random() * values.length)]
    }

    const updateReels = () => {
        reel1.label = getRandomValue()
        reel2.label = getRandomValue()
        reel3.label = getRandomValue()
    }

    const finishSpin = () => {
        const uniqueValues = new Set([reel1.label, reel2.label, reel3.label]).size
        if (uniqueValues === 1) {
            // All 3 values are the same
            result.label = '💰 Jackpot!'
            result.textColor = '#FDFF00'
        } else if (uniqueValues === 2) {
            // 2 values are the same
            result.label = '😍 Winner!'
            result.textColor = '#FDFF00'
        } else {
            // No values are the same
            result.label = '🙁 Spin Again'
            result.textColor = null
        }
        spinning = false
    }

    var tbItems = [
        new TouchBarButton({
            label: '🛠 DevTools',
            backgroundColor: '#645922',
            click: () => { mainWindow.webContents.send('toggle-devtools', '') }
        }),
        new TouchBarButton({
            label: '🤷🏼 Close',
            backgroundColor: '#642222',
            click: () => {
                app.quit()
            }
        }),
        new TouchBarButton({
            label: '📖 Doc',
            backgroundColor: '#266072',
            click: showDoc
        }),
        spin,
        new TouchBarSpacer({ size: 'small' }),
        reel1,
        new TouchBarSpacer({ size: 'small' }),
        reel2,
        new TouchBarSpacer({ size: 'small' }),
        reel3,
        new TouchBarSpacer({ size: 'large' }),
        result
    ]

    const touchBar = new TouchBar({
        items: tbItems
    })

    mainWindow.setTouchBar(touchBar)

    return mainWindow;


    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('window-all-closed', function () {
    app.quit()
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.