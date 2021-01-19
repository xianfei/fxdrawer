// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.$ = window.jQuery = require("./jquery.js");

// const customTitlebar = require('custom-electron-titlebar');

// var titlebar;

const {ipcRenderer, remote} = require('electron')

let objMap = new Map();
var objIndex = 2110;
var clickID = -1;
var clickResolve = null;
var fillColor = 'rgba(0,255,0,0.3)';
var strokeColor = 'rgba(0,255,0,0.3)';
var strokeWidth = 0.0

function setFillColor(obj){
    fillColor = 'rgba('+obj["color-r"]+','+obj["color-g"]+','+obj["color-b"]+','+obj["color-a"]+')'
}

function setStroke(obj){
    strokeColor = 'rgba('+obj["stroke-r"]+','+obj["stroke-g"]+','+obj["stroke-b"]+','+obj["stroke-a"]+')'
    strokeWidth = obj["stroke-w"]
}

function clickHandler(id) {
    clickID = id;
    if(clickResolve!=null)clickResolve();
}

async function guiParser(jsonStr) {
    try {
    console.log(jsonStr.toString())
    const obj = JSON.parse(jsonStr.toString());
    switch (obj.action) {
        case 'draw':
            switch (obj.shape) {
                case 'polygon':
                    setFillColor(obj)
                    if(obj.hasOwnProperty('stroke-r'))setStroke(obj);
                    else strokeColor = 'rgba(0,0,0,0.0)'
                    drawXYArray(obj["x-array"], obj["y-array"]);
                    objIndex++;
                    return objIndex - 1;
                case 'rectangle':
                    if(obj.hasOwnProperty('stroke-r'))setStroke(obj);
                    else strokeColor = 'rgba(0,0,0,0.0)'
                    setFillColor(obj)
                    drawXYArray([obj.x, obj.x + obj.w, obj.x + obj.w, obj.x], [obj.y, obj.y, obj.y + obj.h, obj.y + obj.h]);
                    objIndex++;
                    return objIndex - 1;
                case 'circle':
                    if(obj.hasOwnProperty('stroke-r'))setStroke(obj);
                    else strokeColor = 'rgba(0,0,0,0.0)'
                    setFillColor(obj)
                    drawCircle(obj.x, obj.y, obj.r);
                    objIndex++;
                    return objIndex - 1;
            }
            break;
        case 'add':
            switch (obj["object"]){
                case 'label':
                    setFillColor(obj);
                    $('#controlObjs').append('<font id="' + objIndex + '" style="font-size: '+obj.size+'px;white-space: pre-line;position:absolute;left:'+ obj.x+'px;top:'+obj.y+'px;color:'+fillColor+'">'+obj.str+'</font>');
                    objIndex++;
                    return objIndex - 1;
                case 'button':
                    $('#controlObjs').append('<button onclick="clickHandler('+objIndex+')" id="' + objIndex + '" style="position:absolute;left:'+ obj.x+'px;top:'+obj.y+'px;height: '+obj.h+'px;width: '+obj.w+'px;">'+obj.str+'</button>');
                    objIndex++;
                    return objIndex - 1;
                case 'input':
                    $('#controlObjs').append('<input '+(typeof obj.type==='undefined'?'':('type="'+obj.type+'" '))+'id="' + objIndex + '" style="position:absolute;left:'+ obj.x+'px;top:'+obj.y+'px;height: '+obj.h+'px;width: '+obj.w+'px;"></input>');
                    objIndex++;
                    return objIndex - 1;
            }break;
        case 'change':
            switch (obj["object"]){
                case 'str':
                    document.getElementById(''+obj.id).innerText = obj.str;
                    return '';
            }break;
        case 'get':
            switch (obj["object"]){
                case 'wait-click':
                    await new Promise(function (resolve) {
                        clickResolve = resolve;
                    });
                    clickResolve = null;
                    return clickID;
                case 'str':
                    if($('#'+obj.id).attr("value")!=="undefined")
                        return $('#'+obj.id).val().toString();
                    else return $(''+obj.id).innerText.toString();
            }break;
        case 'delete':
            document.getElementById(''+obj.id).remove()
            break;
        case 'execute':
            var ret = eval(obj.code)
            return JSON.stringify(ret).toString();
    }
    return '';
}catch(err) {
    // console.error(err.message);
    if(err.message !== "Cannot read property 'toString' of undefined")
        mdui.alert(err.message,'Exception');
    return '';
} 
}

window.onload = function (e) {
    draginit(e)
    if(process.platform !== 'darwin'){
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
      onclick="ipcRenderer.send('devtools', '')" title="Toggle Dev Tools"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">dvr</i></button>
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;left: 40px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="ipcRenderer.send('showdoc', '')" title="Show Document"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">help_outline</i></button>
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;left: 75px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="(()=>{$('#designer').toggle();var x = document.getElementsByClassName('designerobj');var i;for (i = 0; i < x.length; i++)x[i].remove();x = document.getElementsByClassName('box');for (i = 0; i < x.length; i++)x[i].remove();})()" title="Designer Assistant"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">grid_on</i></button>
      `
      maximizeBtn()
    document.getElementById('maxbtn').addEventListener('click', ()=>{
      maximizeBtn()
    })
    }else{
        document.getElementById('btns').innerHTML = String.raw`
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 5px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="ipcRenderer.send('devtools', '')" title="Toggle Dev Tools"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">dvr</i></button>
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 40px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="ipcRenderer.send('showdoc', '')" title="Show Document"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">help_outline</i></button>
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 75px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="(()=>{$('#designer').toggle();var x = document.getElementsByClassName('designerobj');var i;for (i = 0; i < x.length; i++)x[i].remove();x = document.getElementsByClassName('box');for (i = 0; i < x.length; i++)x[i].remove();})()" title="Designer Assistant"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">grid_on</i></button>
      `
    }

    $('#designer').toggle()

    $('#coordiv').css('height',(remote.getCurrentWindow().getBounds().height - 28))

    ipcRenderer.on('connect-broke', async function (event, ...args) {
        document.getElementById('connectbroke').innerText = ' 连接已断开'
    })
    

    
    // 监听绘图请求
    ipcRenderer.on('opt-request', async function (event, ...args) {
        const ret = await guiParser(args[0]);
        event.sender.send('opt-reply', ret)
    })
    $('#controlObjs').attr('style','height:'+(remote.getCurrentWindow().getBounds().height - 50) + 'px;width='+ remote.getCurrentWindow().getBounds().width + 'px;')
    // document.getElementsByClassName('menubar-menu-title')[0].innerHTML = '<i class="fa fa-wrench fa-lg" aria-hidden="true" style="opacity:0.6"></i>&nbsp;DevTools'
    // document.getElementsByClassName('menubar-menu-title')[1].innerHTML = '<i class="fa fa-book fa-lg" aria-hidden="true" style="opacity:0.6"></i>&nbsp;Help'

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

function drawXYArray(xArray, yArray) {
    $("#drawThings").append(
        '<canvas id="' + objIndex + '" width="' + remote.getCurrentWindow().getBounds().width + 'px" height="' + (remote.getCurrentWindow().getBounds().height - 50) + 'px" style="position:absolute;left:0;top:0;background:rgba(255,255,255,0);"></canvas>');
    let canvas = document.getElementById('' + objIndex);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.moveTo(xArray[0], yArray[0]);
    for (let i = 1; i < xArray.length; i++) {
        ctx.lineTo(xArray[i], yArray[i]);
    }
    ctx.closePath();
    ctx.lineWidth = strokeWidth;
    ctx.fill();
    ctx.stroke();
}

function drawCircle(x, y, r) {
    $("#drawThings").append(
        '<canvas id="' + objIndex + '" width="' + remote.getCurrentWindow().getBounds().width + 'px" height="' + (remote.getCurrentWindow().getBounds().height - 50) + 'px" style="position:absolute;left:0;top:0;background:rgba(255,255,255,0);"></canvas>');
    let canvas = document.getElementById('' + objIndex);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.lineWidth = strokeWidth;
    ctx.fill();
    ctx.stroke();
}


