

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
var window_height = 0;
var window_width = 0;

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
      case 'init': {
        window_height = obj.height;
        window_width = obj.width;
        $('#fxdwindow').css('height', '' + (obj.height + 30) + 'px')
        $('#fxdwindow').css('width', '' + obj.width + 'px')
        $('#controlObjs').attr('style', 'height:' + (window_height - 10) + 'px;width=' + (window_width - 10)+ 'px;')
        $("#drawThings").append(
          '<canvas id="fxpoints" width="' + (window_width - 10) + 'px" height="' + (window_height - 10) + 'px" style="position:absolute;left:0;top:0;background:rgba(255,255,255,0);"></canvas>');
        document.getElementById('connectbroke').innerText = ' '

        break;
      }
      case 'exit': {
        document.getElementById('connectbroke').innerText = ' 服务器端关闭了这个程序'
        break;
      }
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
            $('#controlObjs').append('<span id="' + objIndex + '" style="font-size: ' + obj.size + 'px;width:max-content;white-space: pre-line;position:absolute;left:' + obj.x + 'px;top:' + obj.y + 'px;color:' + fillColor + '">' + obj.str + '</span>');
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
              $(".mdui-dialog").draggable()
              var e = $('.mdui-overlay')[0];
              var eClone = e.cloneNode(true);
              e.parentNode.replaceChild(eClone, e);
            });
            return '' + choosed;
          case 'input':
            var str = '';
            await new Promise(function (resolve) {
              mdui.prompt(obj.hint, function (value) { str = value; resolve(); }, function (value) { resolve(); }, { type: 'textarea' });
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
            return '(' + (clickX - parseInt($('#fxdwindow').css('left'))) + ',' + (clickY - 28 - parseInt($('#fxdwindow').css('top'))) + ')';
          case 'wait-any': // 返回id或xy值或键盘按键
            var isButton = false;
            if (!isClickedXy) {
              await new Promise(function (resolve) {
                clickResolve = function () { isButton = true; resolve(); }
                clickXyResolve = resolve;
              });
            }
            if (isButton) return 'id:' + clickID;
            else return 'xy:' + (clickX - parseInt($('#fxdwindow').css('left'))) + ',' + (clickY - 28 - parseInt($('#fxdwindow').css('top')));
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
    //
    if (err.message !== "Cannot read property 'toString' of undefined")
      console.error(err.message);
    return '';
  }
}



window.onload = function (e) {
  draginit(e)
  // ipcRenderer.on('connect-broke', function (event, ...args) {
  //   document.getElementById('connectbroke').innerText = ' 连接已断开'
  // })

  var ws = new WebSocket("ws://" + document.location.host + "/ws");
  ws.onopen = function (e) {
    console.log('Connection to server opened');
  }

  ws.onmessage = async function (e) {
    console.log(e.data);
    const ret = await guiParser(e.data);
    ws.send(ret);
  };

  ws.onclose = function () {
    document.getElementById('connectbroke').innerText = ' 连接已断开'
  }

  ws.onerror = function () {
    document.getElementById('connectbroke').innerText = ' 连接失败'
  }

}



function drawXYArray(xArray, yArray) {
  $("#drawThings").append(
    '<canvas id="' + objIndex + '" width="' + (window_width - 10) + 'px" height="' + (window_height - 10) + 'px" style="position:absolute;left:0;top:0;background:rgba(255,255,255,0);"></canvas>');
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
    '<canvas id="' + objIndex + '" width="' + (window_width - 10) + 'px" height="' + (window_height - 10) + 'px" style="position:absolute;left:0;top:0;background:rgba(255,255,255,0);"></canvas>');
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

var lastx = -1000, lasty = -1000;
var lastmill = 0
function drawPoint(x, y, r, smooth) {
  let canvas = document.getElementById('fxpoints');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  var millnow = new Date().getTime();
  if (((x - lastx) * (x - lastx) + (y - lasty) * (y - lasty)) < smooth * smooth && millnow - lastmill < 100) {
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = 2 * r;
    ctx.moveTo(lastx, lasty);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.closePath();
  }
  lastx = x;
  lasty = y;
  lastmill = millnow;
  ctx.fill();
}

function draginit(e) {
  e = e || window.event;

  document.getElementById('drawThings').onmousedown = function (e) {
    isClickedXy = true;
    if (clickXyResolve != null) clickXyResolve();
    clickX = e.pageX;
    clickY = e.pageY;
  }

  // 鼠标按下

  // 鼠标移动
  document.onmousemove = function (e) {
    if (isClickedXy) {
      clickX = e.pageX;
      clickY = e.pageY;
    }
  };

  // 鼠标抬起
  document.onmouseup = function (e) {
    isClickedXy = false;
    // console.log('抬起x: ' + e.pageX + '  y: ' + e.pageY)
  };

};

function randomBG() {
  $('body').css('height', '' + window.innerHeight + 'px')
  window.onresize = function () { $('body').css('height', '' + window.innerHeight + 'px') }
  var index = Math.floor(Math.random() * Math.floor(8))
  $('body').css('background-image', 'url(https://bing.biturl.top/?resolution=1920&format=image&index=' + index + '&mkt=zh-CN)');
  $('body').css('background-position', 'center center')
  $('body').css('background-size', 'cover')
  $('body').css(' background-attachment', 'fixed')
  $('body').css('background-repeat', 'no-repeat')
}