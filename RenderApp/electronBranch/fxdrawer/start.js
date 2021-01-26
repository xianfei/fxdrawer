// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.$ = window.jQuery = require("./jquery.js");

// const customTitlebar = require('custom-electron-titlebar');

// var titlebar;

const { ipcRenderer, remote } = require('electron')

var sudo = require('sudo-prompt');

var cp = require('child_process');
var options = {
  name: 'Electron'
};

var fxPath;

var isDevToolsOpen = false;

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



window.onload = function () {
  if (process.platform !== 'darwin') {
    document.getElementById('btns').innerHTML = String.raw`<button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 5px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="remote.getCurrentWindow().close()" title="close"><i class="mdui-icon material-icons" style="font-size: 20px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">close</i></button>
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 40px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="maxbtn"
      ><i class="mdui-icon material-icons" style="font-size: 20px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">close</i></button>
  <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 75px;top: 0;-webkit-app-region: no-drag;z-index: 11;" id="minbtn"
      onclick="remote.getCurrentWindow().minimize()" style="font-size: small;"><font style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">—</font></button>

      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;left: 5px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="toggleDevTools(remote.getCurrentWindow())" title="Toggle Dev Tools"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">dvr</i></button>
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;left: 40px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="ipcRenderer.send('showdoc', '')" title="Show Document"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">help_outline</i></button>
      `
    maximizeBtn()
    document.getElementById('maxbtn').addEventListener('click', () => {
      maximizeBtn()
    })
  } else {
    document.getElementById('btns').innerHTML = String.raw`
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 5px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="toggleDevTools(remote.getCurrentWindow())" title="Toggle Dev Tools"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">dvr</i></button>
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 40px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="ipcRenderer.send('showdoc', '')" title="Show Document"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">help_outline</i></button>
      `
  }

  ipcRenderer.on('connect-broke', async function (event, ...args) {
    document.getElementById('connectbroke').innerText = ' 连接已断开'
  })

  ipcRenderer.on('toggle-devtools', function (event, ...args) {
    toggleDevTools(remote.getCurrentWindow())
  })




  if (process.platform == 'win32')
    fxPath = remote.getGlobal('sharedObject').prop1[0].substring(0, remote.getGlobal('sharedObject').prop1[0].lastIndexOf('\\'));
  else fxPath = remote.getGlobal('sharedObject').prop1[0].substring(0, remote.getGlobal('sharedObject').prop1[0].lastIndexOf('/'));
  $('#dir').text(fxPath)

  var pathStr;




  if (process.platform == 'win32') {
    pathStr = process.env['path']
    if (pathStr.indexOf(fxPath) != -1) {
      $('#result').text('已经在Path中了。')
      $('#addtopathBtn').hide()
    } else {
      $('#result').text('不在Path中。')
    }
    console.log(pathStr)

  }
  else {
    cp.exec('echo $PATH', (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      pathStr = stdout;
      if (pathStr.indexOf(fxPath) != -1) {
        $('#result').text('已经在Path中了。')
        $('#addtopathBtn').hide()
      } else {
        $('#result').text('不在Path中。')
      }
      console.log(pathStr)
    })
  }




  $('#addtopathBtn').on('click', addToPath)
}

function addToPath() {
  if (process.platform == 'win32') {
    sudo.exec('setx PATH "' + fxPath + ';%PATH%" /m && setx FXDRAWER_HOME "' + fxPath + '" /m', options,
      function (error, stdout, stderr) {
        if (error) {
          console.log(error);
          cp.exec('setx PATH "' + fxPath + ';%PATH%" && setx FXDRAWER_HOME "' + fxPath + '"', (err, stdout, stderr) => {
            if (err) {
              console.log(err);
              return;
            }
            $('#stdout').html(stdout + '<br>添加成功后，您需要重新打开fxDrawer程序才可生效');
          })
          return;
        }
        $('#stdout').html(stdout + '<br>添加成功后，您需要重新打开fxDrawer程序才可生效');
      }
    );
  } else if (process.platform == 'darwin') {
    sudo.exec('echo "' + fxPath + '" > /etc/paths.d/fxdrawer', options,
      function (error, stdout, stderr) {
        if (error) throw error;
        $('#stdout').html(stdout + '<br>添加成功后，您需要重新打开fxDrawer程序才可生效');
      }
    );
  } else {
    $('#stdout').html('该功能暂时只支持Windows和macOS');
  }
}


var isMax = true;
function maximizeBtn() {
  if (isMax) {
    remote.getCurrentWindow().restore();
    document.getElementById('maxbtn').innerHTML = '<i class="mdui-icon material-icons" style="font-size: 20px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">fullscreen</i>';
  } else {
    remote.getCurrentWindow().maximize();
    document.getElementById('maxbtn').innerHTML = '<i class="mdui-icon material-icons" style="font-size: 20px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">fullscreen_exit</i>';
  }
  isMax = !isMax
}
