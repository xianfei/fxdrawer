// Modules to control application life and create native browser window
const {app, BrowserWindow, TouchBar, ipcMain} = require('electron')
const {TouchBarLabel, TouchBarButton, TouchBarSpacer} = TouchBar
var net = require('net');
var HOST = '127.0.0.1';
var PORT = 6666;
var mainWindow;
var docWindow;
var isDevToolsOpen = false;

async function netParser() {
    net.createServer(function (sock) {
        // 我们获得一个连接 - 该连接自动关联一个socket对象
        console.log('CONNECTED: ' +
            sock.remoteAddress + ':' + sock.remotePort);

        // 为这个socket实例添加一个"data"事件处理函数
        sock.on('data', async function (data) {
            // console.log('DATA ' + sock.remoteAddress + ': ' + data.subarray(2).toString('utf8'));
            const obj = JSON.parse(data.subarray(2).toString('utf8'));
            var ret = ''; // 返回值字符串
            switch (obj.action) {
                case 'init':
                    createWindow(obj.width, obj.height + 30);
                    // 等待窗口加载完成
                    await new Promise(resolve => mainWindow.webContents.once('dom-ready', resolve));
                    break;
                case 'exit':
                    app.quit()
                    break;
                default:
                    mainWindow.webContents.send('opt-request', data.subarray(2).toString('utf8'))
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
            app.quit()
        });

    }).listen(PORT, HOST);
}

function showDoc(){
    docWindow = new BrowserWindow({
        width: 1200,
        height: 700,
    })

    // and load the index.html of the app.
    docWindow.loadFile('readme.html')

    docWindow.setTouchBar(new TouchBar({
        items: [
            new TouchBarButton({
                label: '👌 Got it and Close',
                backgroundColor: '#22644d',
                click: () => {
                    docWindow.close();
                }
            }),
            new TouchBarLabel({label: "fxDrawer by xianfei HTML5 Electron 技术预览版"})
        ]
    }))
}

function toggleDevTools(){
    if(!isDevToolsOpen) {
        mainWindow.setSize(mainWindow.getBounds().width+400, mainWindow.getBounds().height)
        mainWindow.webContents.openDevTools()
    }else {
        mainWindow.setSize(mainWindow.getBounds().width-400, mainWindow.getBounds().height)
        mainWindow.webContents.closeDevTools()
    }
    isDevToolsOpen =!isDevToolsOpen
}

function createWindow(w, h) {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: w,
        height: h,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    let template = [
        {
            label:'fxDrawer',
            submenu: [{
                label: 'Toggle Dev Tools',
                accelerator: 'CmdOrCtrl+Alt+D',
                click: toggleDevTools
            },{
                label: 'Open fxDrawer Document',
                accelerator: 'CmdOrCtrl+Alt+H',
                click: showDoc
            },{
                type: 'separator'
            },{
                label: 'fxDrawer by xianfei',
                enabled: false
            }]
        }
    ]

    const {Menu} = require('electron');
    let menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    // TouchBar API only works on macOS devices with a TouchBar.
    if (process.platform !== 'darwin') return

    // 附赠彩蛋：老虎机

    let spinning = false

    // Reel labels
    const reel1 = new TouchBarLabel({label: '<- Easter egg!🌟'})
    const reel2 = new TouchBarLabel({label: "fxDrawer by xianfei"})
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
        new TouchBarSpacer({size: 'small'}),
        reel1,
        new TouchBarSpacer({size: 'small'}),
        reel2,
        new TouchBarSpacer({size: 'small'}),
        reel3,
        new TouchBarSpacer({size: 'large'}),
        result
    ]

    const touchBar = new TouchBar({
        items: tbItems
    })

    mainWindow.setTouchBar(touchBar)


    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(netParser)

app.on('window-all-closed', function () {
    app.quit()
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.