// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.$ = window.jQuery = require("./jquery.js");

const { ipcRenderer, remote } = require('electron')

var objIndex = 2109;
var clickID = -1;
var clickResolve = null;
var isClickedXy = false;
var clickX = 0;
var clickY = 0;
var clickXyResolve = null;
var fillColor = 'rgba(0,255,0,0.3)';
var strokeColor = 'rgba(0,255,0,0.3)';
var strokeWidth = 0.0

function setFillColor(obj) {
  if (obj.hasOwnProperty('color')) {
    fillColor = obj["color"];
  }
  else {
    fillColor = 'rgba(' + obj["color-r"] + ',' + obj["color-g"] + ',' + obj["color-b"] + ',' + obj["color-a"] + ')';
  }
}

function setStroke(obj) {
  if (obj.hasOwnProperty('stroke-color')) {
    strokeColor = obj["stroke-color"];
  }
  else {
    strokeColor = 'rgba(' + obj["stroke-r"] + ',' + obj["stroke-g"] + ',' + obj["stroke-b"] + ',' + obj["stroke-a"] + ')';
    strokeWidth = obj["stroke-w"];
  }
}

function clickHandler(id) {
  clickID = id;
  if (clickResolve != null) clickResolve();
}

async function guiParser(jsonStr) {
  try {
    // console.log(jsonStr.toString())
    const obj = JSON.parse(jsonStr.toString());
    switch (obj.action) {
      case 'draw':
        switch (obj.shape) {
          case 'polygon':
            objIndex++;
            setFillColor(obj)
            if (obj.hasOwnProperty('stroke-r')) setStroke(obj);
            else strokeColor = 'rgba(0,0,0,0.0)'
            drawXYArray(obj["x-array"], obj["y-array"]);
            return objIndex;
          case 'rectangle':
            objIndex++;
            if (obj.hasOwnProperty('stroke-r')) setStroke(obj);
            else strokeColor = 'rgba(0,0,0,0.0)'
            setFillColor(obj)
            drawXYArray([obj.x, obj.x + obj.w, obj.x + obj.w, obj.x], [obj.y, obj.y, obj.y + obj.h, obj.y + obj.h]);
            return objIndex;
          case 'circle':
            objIndex++;
            if (obj.hasOwnProperty('stroke-r')) setStroke(obj);
            else strokeColor = 'rgba(0,0,0,0.0)'
            setFillColor(obj)
            drawCircle(obj.x, obj.y, obj.r);
            return objIndex;
          case 'point':
            setFillColor(obj)
            drawPoint(obj.x, obj.y, obj.r, obj.smooth);
            return '';
        }
        break;
      case 'add':
        switch (obj["object"]) {
          case 'label':
            objIndex++;
            setFillColor(obj);
            $('#controlObjs').append('<span id="' + objIndex + '" style="font-size: ' + obj.size + 'px;white-space: pre-line;position:absolute;left:' + obj.x + 'px;top:' + obj.y + 'px;color:' + fillColor + '">' + obj.str + '</span>');
            return objIndex;
          case 'image':
            objIndex++;
            setFillColor(obj);
            $('#controlObjs').append('<img onclick="clickHandler(' + objIndex + ')" id="' + objIndex + '" src="' + obj.path + '" style="position:absolute;left:' + obj.x + 'px;top:' + obj.y + 'px;height: ' + obj.h + 'px;width: ' + obj.w + 'px;"></img>');
            return objIndex;
          case 'button':
            objIndex++;
            $('#controlObjs').append('<button onclick="clickHandler(' + objIndex + ')" id="' + objIndex + '" style="position:absolute;left:' + obj.x + 'px;top:' + obj.y + 'px;height: ' + obj.h + 'px;width: ' + obj.w + 'px;">' + obj.str + '</button>');
            return objIndex;
          case 'input':
            objIndex++;
            $('#controlObjs').append('<input onchange="clickHandler(' + objIndex + ')" ' + (typeof obj.type === 'undefined' ? '' : ('type="' + obj.type + '" ')) + 'id="' + objIndex + '" style="position:absolute;left:' + obj.x + 'px;top:' + obj.y + 'px;height: ' + obj.h + 'px;width: ' + obj.w + 'px;"></input>');
            return objIndex;
        }break;
      case 'change':
        switch (obj["object"]) {
          case 'str':
            document.getElementById('' + obj.id).innerText = obj.str;
            return '';
          case 'path':
            $('#' + obj.id).attr("src", obj.path);
            return '';
          case 'position':
            $('#' + obj.id).css('left', '' + obj.x + 'px');
            $('#' + obj.id).css('top', '' + obj.y + 'px');
            return '';
        }break;
      case 'show':
        switch (obj["object"]) {
          case 'filechooser':
            return remote.dialog.showOpenDialogSync().toString();
          case 'savefile':
            return remote.dialog.showSaveDialogSync().toString();
          case 'dialog':
              var buts = obj.option.split('|');
              var choosed = await new Promise(function (resolve) {
                var buttons = []
                for (let index = 0; index < buts.length; index++) {
                  buttons.push({
                    text: buts[index],
                    onClick: function (inst) { resolve(index + 1) }
                  })
                }
                buttons.push({
                      text: '取消',
                      onClick: function (inst) { resolve(0) }
                    }
                )
                mdui.dialog({
                  content: obj.str,
                  buttons: buttons
                });
                var e = $('.mdui-overlay')[0];
                var eClone = e.cloneNode(true);
                e.parentNode.replaceChild(eClone, e);
              });
              return ''+choosed;
          case 'input':
            var str ='';
            await new Promise(function (resolve) {
              mdui.prompt(obj.hint,function (value) { str=value; resolve();}, function (value) { resolve();} ,{ type: 'textarea' });
            });
            return str;
        }break;
      case 'get':
        switch (obj["object"]) {
          case 'wait-click':
            await new Promise(function (resolve) {
              clickResolve = resolve;
            });
            clickResolve = null;
            var clickID_ = clickID;
            clickID = -1;
            return clickID_;
          case 'wait-click-xy':
            if (!isClickedXy) {
              await new Promise(function (resolve) {
                clickXyResolve = function () { clickXyResolve = null; resolve(); };
              });
            }
            return '(' + clickX + ',' + (clickY-28) + ')';
          case 'wait-any': // 返回id或xy值或键盘按键
            var isButton = false;
            if (!isClickedXy) {
            await new Promise(function (resolve) {
              clickResolve = function(){isButton=true;resolve();}
              clickXyResolve = resolve;
            });}
            if(isButton)return 'id:'+clickID;
            else return 'xy:' + clickX +',' + (clickY-28);
          case 'str':
            if ($('#' + obj.id).attr("value") !== "undefined")
              return $('#' + obj.id).val().toString();
            else return $('' + obj.id).innerText.toString();
        }break;
      case 'delete':
        document.getElementById('' + obj.id).remove()
        break;
      case 'clear':
        switch (obj["object"]) {
          case 'draw':
            var width_ = $("#fxpoints").attr('width')
            var height_ = $("#fxpoints").attr('height')
            document.getElementById("drawThings").childNodes.forEach(element => {
              element.remove();
            });
            $("#drawThings").append(
              '<canvas id="fxpoints" width="' + width_ + '" height="' + height_ + '" style="position:absolute;left:0;top:0;background:rgba(255,255,255,0);"></canvas>');
                break;
        }break;
      case 'execute':
        var ret = eval(obj.code)
        return JSON.stringify(ret).toString();
    }
    return '';
  } catch (err) {
    // console.error(err.message);
    if (err.message !== "Cannot read property 'toString' of undefined")
      mdui.alert(err.message, 'Exception');
    return '';
  }
}

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


window.onload = function (e) {
  draginit(e)
  // 非macos平台上 标题栏 六个按钮的HTML
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
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;left: 75px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="showDesigner()" title="Designer Assistant"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">grid_on</i></button>
      `
    maximizeBtn()
    document.getElementById('maxbtn').addEventListener('click', () => {
      maximizeBtn()
    })
  } else {
    // macos平台上 标题栏 3个按钮的HTML
    document.getElementById('btns').innerHTML = String.raw`
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 5px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="toggleDevTools(remote.getCurrentWindow())" title="Toggle Dev Tools"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">dvr</i></button>
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 40px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="ipcRenderer.send('showdoc', '')" title="Show Document"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">help_outline</i></button>
      <button class="mdui-btn mdui-btn-icon"
      style="height:28px;width:28px;min-width:28px;line-height:28px;position: fixed;right: 75px;top: 0px;-webkit-app-region: no-drag;z-index: 11;" id="closebtn"
      onclick="showDesigner()" title="Designer Assistant"><i class="mdui-icon material-icons" style="font-size: 18px;text-shadow: 0 0 3px #fff, 0 0 3px #fff; ">grid_on</i></button>
      `
  }

  $('#designer').toggle()

  $('#coordiv').css('height', (remote.getCurrentWindow().getBounds().height - 28))

  $("#drawThings").append(
    '<canvas id="fxpoints" width="' + remote.getCurrentWindow().getBounds().width + 'px" height="' + (remote.getCurrentWindow().getBounds().height - 30) + 'px" style="position:absolute;left:0;top:0;background:rgba(255,255,255,0);"></canvas>');

  ipcRenderer.on('connect-broke', function (event, ...args) {
    document.getElementById('connectbroke').innerText = ' 连接已断开'
  })

  ipcRenderer.on('toggle-devtools', function (event, ...args) {
    toggleDevTools(remote.getCurrentWindow())
  })



  // 监听绘图请求
  ipcRenderer.on('opt-request', async function (event, ...args) {
    const ret = await guiParser(args[0]);
    event.sender.send('opt-reply-'+remote.getCurrentWindow().id, ret)
  })
  $('#controlObjs').attr('style', 'height:' + (remote.getCurrentWindow().getBounds().height - 30) + 'px;width=' + remote.getCurrentWindow().getBounds().width + 'px;')
  // document.getElementsByClassName('menubar-menu-title')[0].innerHTML = '<i class="fa fa-wrench fa-lg" aria-hidden="true" style="opacity:0.6"></i>&nbsp;DevTools'
  // document.getElementsByClassName('menubar-menu-title')[1].innerHTML = '<i class="fa fa-book fa-lg" aria-hidden="true" style="opacity:0.6"></i>&nbsp;Help'

}

var isShowDesigner = false;
function showDesigner() {
  isShowDesigner = !isShowDesigner;
  $('#designer').toggle();
  var x = document.getElementsByClassName('designerobj');
  var i; for (i = 0; i < x.length; i++)
    x[i].remove();
  x = document.getElementsByClassName('box');
  for (i = 0; i < x.length; i++)
    x[i].remove();
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

function drawXYArray(xArray, yArray) {
  $("#drawThings").append(
    '<canvas id="' + objIndex + '" width="' + remote.getCurrentWindow().getBounds().width + 'px" height="' + (remote.getCurrentWindow().getBounds().height - 30) + 'px" style="position:absolute;left:0;top:0;background:rgba(255,255,255,0);"></canvas>');
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
    '<canvas id="' + objIndex + '" width="' + remote.getCurrentWindow().getBounds().width + 'px" height="' + (remote.getCurrentWindow().getBounds().height - 30) + 'px" style="position:absolute;left:0;top:0;background:rgba(255,255,255,0);"></canvas>');
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

var lastx=-1000,lasty=-1000;
var lastmill = 0
function drawPoint(x, y, r, smooth) {
  let canvas = document.getElementById('fxpoints');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  var millnow=new Date().getTime();
  if(((x-lastx)*(x-lastx)+(y-lasty)*(y-lasty))<smooth*smooth&&millnow-lastmill<100){
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = 2*r;
    ctx.moveTo(lastx, lasty);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.stroke();
  }else{
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.closePath();
  }
  lastx=x;
  lasty=y;
  lastmill = millnow;
  ctx.fill();
}

function draginit(e) {
  e = e || window.event;
  // startX, startY 为鼠标点击时初始坐标
  // diffX, diffY 为鼠标初始坐标与 box 左上角坐标之差，用于拖动
  var startX, startY, diffX, diffY;
  // 是否拖动，初始为 false
  var dragging = false;

  var coordiv = document.getElementById('coordiv');

  document.getElementById('drawThings').onmousedown = function (e) {
    isClickedXy = true;
    if (clickXyResolve != null) clickXyResolve();
    clickX = e.pageX;
    clickY = e.pageY;
  }

  // 鼠标按下
  document.onmousedown = function (e) {
    if (!isShowDesigner) return;

    startX = e.pageX;
    startY = e.pageY;

    // 如果鼠标在 box 上被按下,坐标判定防止在box之外
    if (startY <= coordiv.offsetTop + coordiv.offsetHeight && startY >= coordiv.offsetTop && startX >= coordiv.offsetLeft && startX <= coordiv.offsetLeft + coordiv.offsetWidth) {
      if (e.target.className.match(/box/)) {
        // 允许拖动
        dragging = true;

        // 设置当前 box 的 id 为 moving_box
        if (document.getElementById("moving_box") !== null) {
          document.getElementById("moving_box").removeAttribute("id");
        }
        e.target.id = "moving_box";

        // 计算坐标差值
        diffX = startX - e.target.offsetLeft;
        diffY = startY - e.target.offsetTop;
      }
      else {
        // 在页面创建 box
        var active_box = document.createElement("div");
        active_box.id = "active_box";
        active_box.className = "box";
        active_box.style.top = startY + 'px';
        active_box.style.left = startX + 'px';
        active_box.style.background = '#' + Math.floor(Math.random() * (2 << 23)).toString(16);
        document.getElementById("designer").appendChild(active_box);
        active_box = null;
      }
    }

  };

  // 鼠标移动
  document.onmousemove = function (e) {
    if (isClickedXy) {
      clickX = e.pageX;
      clickY = e.pageY;
    }
    if (!isShowDesigner) return;
    if (e.pageY <= coordiv.offsetTop + coordiv.offsetHeight && e.pageY >= coordiv.offsetTop && e.pageX >= coordiv.offsetLeft && e.pageX <= coordiv.offsetLeft + coordiv.offsetWidth) {
      // 更新 box 尺寸
      if (document.getElementById("active_box") !== null)//如果document中有active_box,就改变box大小
      {
        var ab = document.getElementById("active_box");
        ab.style.width = e.pageX - startX + 'px';
        ab.style.height = e.pageY - startY + 'px';
      }

      // 移动，更新 box 坐标
      if (document.getElementById("moving_box") !== null && dragging) {
        var mb = document.getElementById("moving_box");
        var xy_div = document.getElementById(mb.style.left.substring(0, mb.style.left.length - 2) + mb.style.top.substring(0, mb.style.top.length - 2));

        var tmx = e.pageX - diffX;
        var tmy = e.pageY - diffY;


        if (tmx + mb.offsetWidth <= coordiv.offsetLeft + coordiv.offsetWidth && tmx >= coordiv.offsetLeft && tmy + mb.offsetHeight <= coordiv.offsetTop + coordiv.offsetHeight && tmy >= coordiv.offsetTop) {
          mb.style.top = e.pageY - diffY + 'px';
          mb.style.left = e.pageX - diffX + 'px';

          if (xy_div !== null) {
            var new_x = mb.style.left.substring(0, mb.style.left.length - 2);
            var new_y = mb.style.top.substring(0, mb.style.top.length - 2);
            xy_div.id = new_x + new_y;
            new_x -= coordiv.offsetLeft;
            new_y -= coordiv.offsetTop;
            // var new_r = parseInt(mb.style.width.substring(0,mb.style.width.length-2))+parseInt(new_x)-coordiv.offsetLeft;
            // var new_b = parseInt(mb.style.height.substring(0,mb.style.height.length-2))+parseInt(new_y)-coordiv.offsetTop;//"[ left: "+ new_x +", top: "+ new_y + ", right: " + new_r +" , bottom: "+ new_b +" ]";
            xy_div.innerHTML = (new_x) + "," + (new_y) + "," + mb.style.width.substring(0, mb.style.width.length - 2) + "," + mb.style.height.substring(0, mb.style.height.length - 2) + '&nbsp;&nbsp;';
            //var input_div = document.getElementById("x_y")
            //input_div.value=xy_div.innerHTML
          }
        }
      }
    }
  };

  // 鼠标抬起
  document.onmouseup = function (e) {
    isClickedXy = false;
    // console.log('抬起x: ' + e.pageX + '  y: ' + e.pageY)
    if (!isShowDesigner) return;
    // 禁止拖动
    dragging = false;
    if (document.getElementById("active_box") !== null) {
      var ab = document.getElementById("active_box");
      ab.removeAttribute("id");
      // 如果长宽均小于 3px，移除 box
      if (ab.offsetWidth < 10 || ab.offsetHeight < 10) {
        document.getElementById("designer").removeChild(ab);
      }
      if (ab.offsetHeight >= 10 && ab.offsetHeight >= 10) {
        var xy_div = document.createElement("font");
        xy_div.className = 'designerobj';
        xy_div.id = startX.toString() + startY.toString();
        document.getElementById("infoBar").appendChild(xy_div);
        xy_div.style.color = ab.style.background;
        xy_div.innerHTML = (startX - coordiv.offsetLeft) + "," + (startY - coordiv.offsetTop) + "," + (e.pageX - startX) + "," + (e.pageY - startY) + '&nbsp;&nbsp;';
      }
    }
  };

};

