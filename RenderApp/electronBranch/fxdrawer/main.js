// Modules to control application life and create native browser window
const { app, BrowserWindow, TouchBar, ipcMain, dialog } = require('electron')
const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar
var net = require('net');
var HOST = '127.0.0.1';
var PORT = 6666;
var isDevToolsOpen = false;
const versionInfo = '0.1.1';

const isMac = process.platform === 'darwin'

const find = require('find-process');

global.sharedObject = {prop1: process.argv}


app.whenReady().then(fxStart)

function fxStart(){
    for (let index = 0; index < process.argv.length; index++) {
        if(process.argv[index]==='listen'){
            index++;
            PORT = parseInt(process.argv[index++]);
            netParser();
            return;
        }else if(process.argv[index]==='showdoc'){
            showDoc();
            return;
        }else if(process.argv[index]==='help'){
            console.log('fxDrawer '+versionInfo+'\n')
            console.log('Usage: fxdrawer [listen <listenPort>] [showdoc] [help]\n')
            app.quit();
            return;
        }
    }
    var helloWindow;
    if (isMac) helloWindow = new BrowserWindow({
        width: 700,
        height: 400,
        titleBarStyle: 'hidden',
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
        }
    });
    else
    helloWindow = new BrowserWindow({
            width: 700,
            height: 400,
            frame: false,
            webPreferences: {
                enableRemoteModule: true,
                nodeIntegration: true,
            }
        })
        helloWindow.loadFile('start.html')
        // helloWindow.toggleDevTools();
        ipcMain.on('showdoc', (event, arg) => {
            showDoc()
        })
    
        ipcMain.on('devtools', (event, arg) => {
            toggleDevTools(helloWindow)
        })
}



async function netParser() {
    let tcpConnect = net.createServer(function (sock) {
        var mainWindow;
        // 我们获得一个连接 - 该连接自动关联一个socket对象
        console.log('CONNECTED: ' +
            sock.remoteAddress + ':' + sock.remotePort);

        // 为这个socket实例添加一个"data"事件处理函数
        sock.on('data', async function (data) {
            // console.log('DATA ' + sock.remoteAddress + ': ' + data.subarray(2).toString('utf8'));
            const obj = JSON.parse(data.subarray(2).toString());
            var ret = ''; // 返回值字符串
            switch (obj.action) {
                case 'init':
                    mainWindow = createWindow(obj.width, obj.height + 30, mainWindow);
                    // 等待窗口加载完成
                    await new Promise(resolve => mainWindow.webContents.once('did-finish-load', resolve));
                    break;
                case 'exit':
                    app.quit()
                    break;
                default:
                    mainWindow.webContents.send('opt-request', data.subarray(2).toString())
                    // 等待事件结束
                    await new Promise(function (resolve) {
                        ipcMain.once('opt-reply', function (event, optRet) {
                            ret += optRet.toString()
                            resolve();
                        })
                    });
                    break;
            }
            // 回发该数据，客户端将收到来自服务端的数据
            sock.write('00ok' + ret);
        });

        // 为这个socket实例添加一个"close"事件处理函数
        sock.on('close', function () {
            console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
            // mainWindow.close()
            mainWindow.webContents.send('connect-broke', '')
        });

        sock.on('error', function (err) {
            // mainWindow.close()
            if (err.code == 'ECONNRESET') 
            mainWindow.webContents.send('connect-broke', '')
        });

    }).listen(PORT, HOST);

    tcpConnect.on('error', function (err) {
        if (err.code == 'EADDRINUSE') {
            find('port', PORT)
                .then(function (list) {
                    if(list[0].name.indexOf('fxdrawer')==-1){
                    if (!list.length) {
                        dialog.showErrorBox('TCP监听错误', '端口被占用？但未找到使用端口'+PORT+'的程序')
                    } else {
                        dialog.showErrorBox('TCP监听错误', '端口'+PORT+'被程序 '+list[0].name+' 占用，您可以在任务管理器中杀死它！')
                        // console.log();
                    }}
                    app.quit()
                })
            
            
        }
    });

}

function showDoc() {
    var docWindow;
    if (isMac) docWindow = new BrowserWindow({
        width: 1200,
        height: 700,
        titleBarStyle: 'hidden',
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
        }
    });
    else
        docWindow = new BrowserWindow({
            width: 1200,
            height: 700,
            frame: false,
            webPreferences: {
                enableRemoteModule: true,
                nodeIntegration: true,
            }
        })

    // and load the index.html of the app.
    docWindow.loadFile('readme.html')

    // docWindow.toggleDevTools()

    if (!isMac) return

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

function toggleDevTools(mainWindow) {
    if (!isDevToolsOpen) {
        mainWindow.setSize(mainWindow.getBounds().width + 400, mainWindow.getBounds().height)
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.setSize(mainWindow.getBounds().width - 400, mainWindow.getBounds().height)
        mainWindow.webContents.closeDevTools()
    }
    isDevToolsOpen = !isDevToolsOpen
}

function createWindow(w, h, mainWindow) {
    // Create the browser window.
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

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    ipcMain.on('showdoc', (event, arg) => {
        showDoc()
    })

    ipcMain.on('devtools', (event, arg) => {
        toggleDevTools(mainWindow)
    })


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
                    click: toggleDevTools
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
            click: () => { toggleDevTools(mainWindow) }
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
            click: toggleDevTools
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