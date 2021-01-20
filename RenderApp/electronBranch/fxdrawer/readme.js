const { remote, ipcRenderer } = require('electron')
const { FindInPage } = require('electron-find')

let findInPage = new FindInPage(remote.getCurrentWebContents(), {
  offsetTop: 30,
  offsetRight: 10
})

var os=require('os');

// const customTitlebar = require('custom-electron-titlebar');

// new customTitlebar.Titlebar({
//     menu:remote.emptyMenu,
//     backgroundColor: customTitlebar.Color.fromHex('#eeeeee00'),
// });

// remote.getCurrentWindow().close();


window.onload = ()=>{

    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
      }
    
      for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
      }
      replaceText('system-version', os.arch()+' platform ( OS: '+(process.platform === 'darwin'?'macOS':os.version())+', '+process.getSystemVersion()+' ) ')

      if(process.platform === 'darwin'){
          document.getElementsByClassName('html_header')[0].setAttribute('style','margin-top:20px')
          document.getElementById('btns').innerHTML = String.raw`<button class="mdui-btn mdui-btn-icon"
        style="position: fixed;right: 10px;top: 0;-webkit-app-region: no-drag;z-index: 11;" id="minbtn"
        onclick="findInPage.openFindWindow()" style="font-size: 20px;"><i class="mdui-icon material-icons" style="font-size: 20px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">search</i></button>
        `
        return
      }

      document.getElementById('btns').innerHTML = String.raw`<button class="mdui-btn mdui-btn-icon"
      style="position: fixed;right: 5px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="remote.getCurrentWindow().close()"><i class="mdui-icon material-icons" style="font-size: 20px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">close</i></button>
      <button class="mdui-btn mdui-btn-icon"
      style="position: fixed;right: 50px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="maxbtn"
      ><i class="mdui-icon material-icons" style="font-size: 20px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">close</i></button>
  <button class="mdui-btn mdui-btn-icon"
      style="position: fixed;right: 95px;top: 0;-webkit-app-region: no-drag;z-index: 11;" id="minbtn"
      onclick="remote.getCurrentWindow().minimize()" style="font-size: small;"><font style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">—</font></button>
      <button class="mdui-btn mdui-btn-icon"
      style="position: fixed;right: 140px;top: 0;-webkit-app-region: no-drag;z-index: 11;" id="minbtn"
      onclick="findInPage.openFindWindow()" style="font-size: 20px;"><i class="mdui-icon material-icons" style="font-size: 20px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">search</i></button>
      `

    maximizeBtn()
    document.getElementById('maxbtn').addEventListener('click', ()=>{
      maximizeBtn()
    })
}

var isMax=true;
function maximizeBtn(){
  if(isMax){
    remote.getCurrentWindow().restore();
    document.getElementById('maxbtn').innerHTML = '<i class="mdui-icon material-icons" style="font-size: 20px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">fullscreen</i>';
  }else{
    remote.getCurrentWindow().maximize();
    document.getElementById('maxbtn').innerHTML = '<i class="mdui-icon material-icons" style="font-size: 20px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">fullscreen_exit</i>';
  }
  isMax=!isMax
}