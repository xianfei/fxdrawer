// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.$ = window.jQuery = require("./jquery.js");

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
                    $('#controlObjs').append('<font id="fxdrawerObj' + objIndex + '" style="white-space: pre-line;position:absolute;left:'+ obj.x+'px;top:'+obj.y+'px;color:'+fillColor+'">'+obj.str+'</font>');
                    objIndex++;
                    return objIndex - 1;
                case 'button':
                    $('#controlObjs').append('<button onclick="clickHandler('+objIndex+')" id="fxdrawerObj' + objIndex + '" style="position:absolute;left:'+ obj.x+'px;top:'+obj.y+'px;height: '+obj.h+'px;width: '+obj.w+'px;">'+obj.str+'</button>');
                    objIndex++;
                    return objIndex - 1;
                case 'input':
                    $('#controlObjs').append('<input id="fxdrawerObj' + objIndex + '" style="position:absolute;left:'+ obj.x+'px;top:'+obj.y+'px;height: '+obj.h+'px;width: '+obj.w+'px;"></input>');
                    objIndex++;
                    return objIndex - 1;
            }break;
        case 'change':
            switch (obj["object"]){
                case 'str':
                    document.getElementById('fxdrawerObj'+obj.id).innerText = obj.str;
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
                    if($('#fxdrawerObj'+obj.id).attr("value")!=="undefined")
                        return $('#fxdrawerObj'+obj.id).val().toString();
                    else return $('fxdrawerObj'+obj.id).innerText.toString();
            }break;
        case 'delete':
            document.getElementById('fxdrawerObj'+obj.id).remove()
    }
    return '';
}

window.onload = function () {
    // 监听绘图请求
    ipcRenderer.on('opt-request', async function (event, ...args) {
        const ret = await guiParser(args[0]);
        event.sender.send('opt-reply', ret)
    })
    $('#controlObjs').attr('style','height:'+(remote.getCurrentWindow().getBounds().height - 50) + 'px;width='+ remote.getCurrentWindow().getBounds().width + 'px;')
}

function drawXYArray(xArray, yArray) {
    $("#drawThings").append(
        '<canvas id="fxdrawerObj' + objIndex + '" width="' + remote.getCurrentWindow().getBounds().width + 'px" height="' + (remote.getCurrentWindow().getBounds().height - 50) + 'px" style="position:absolute;left:0;top:0;background:rgba(255,255,255,0);"></canvas>');
    let canvas = document.getElementById('fxdrawerObj' + objIndex);
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
        '<canvas id="fxdrawerObj' + objIndex + '" width="' + remote.getCurrentWindow().getBounds().width + 'px" height="' + (remote.getCurrentWindow().getBounds().height - 50) + 'px" style="position:absolute;left:0;top:0;background:rgba(255,255,255,0);"></canvas>');
    let canvas = document.getElementById('fxdrawerObj' + objIndex);
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