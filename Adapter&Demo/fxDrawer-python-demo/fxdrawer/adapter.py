import os
import json
import sys
import socket
import time
import re

jarLoc = './untitled.jar'
fxHost = '127.0.0.1'
fxPort = 6666
sock = None  # 创建TCP套接字
verboseMode = True


def initDrawer(w, h):
    global sock
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # os.popen(
    #     '/usr/libexec/java_home -v 1.8 -exec java -jar ' + jarLoc + ' -verbose true -port ' + str(
    #         fxPort) + ' -kill ' + str(os.getpid()))
    os.popen('fxdrawer listen '+ str(fxPort))
    print(os.getpid())
    srv_addr = (fxHost, fxPort)
    while True:
        time.sleep(1)
        try:
            sock.connect(srv_addr)
            break
        except Exception as e:
            sock.close()
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            if verboseMode:
                print(e)
    sendData = {'action': "init", "width": w, "height": h, "killwhenclose": 1, "pid": os.getpid()}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)


class Color:
    def __init__(self, r, g, b, a):
        self.r = r
        self.g = g
        self.b = b
        self.a = a


class Stroke:
    def __init__(self, r, g, b, a, w):
        self.r = r
        self.g = g
        self.b = b
        self.a = a
        self.w = w


stroke = Stroke(0, 0, 0, 0.0, 0.0)

c = Color(0, 0, 0, 0.8)


def setColor(r, g, b, a):
    c.r = r
    c.g = g
    c.b = b
    c.a = a + 0.0  # force it double


def setStroke(r, g, b, a, width):
    stroke.r = r
    stroke.g = g
    stroke.b = b
    stroke.a = a + 0.0  # force it double
    stroke.w = width + 0.0  # force it double


def set_default(obj):
    if isinstance(obj, set):
        return list(obj)
    raise TypeError


def sendDict(sendData):
    buf = bytearray()
    sendStr = json.dumps(sendData, default=set_default)
    buf.append(len(sendStr) >> 8)
    buf.append(len(sendStr) % (1 << 8))
    buf = bytes(buf)
    buf += str.encode(sendStr)
    sock.sendall(buf)
    data = sock.recv(1024)
    return bytes.decode(data[2:])


def drawCircle(x, y, r):
    sendData = {'action': "draw", "shape": "circle", "x": x, "y": y, "r": r, "color-r": c.r, "color-g": c.g,
                "color-b": c.b, "color-a": c.a, "stroke-r": stroke.r, "stroke-g": stroke.g,
                "stroke-b": stroke.b, "stroke-a": stroke.a, "stroke-w": stroke.w}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)
    return int(ret[2:])


def drawPoint(x, y, r):
    sendData = {'action': "draw", "shape": "point", "x": x, "y": y, "r": r, "color-r": c.r, "color-g": c.g,
                "color-b": c.b, "color-a": c.a}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)


def drawRectangle(x, y, w, h):
    sendData = {'action': "draw", "shape": "rectangle", "x": x, "y": y, "w": w, 'h': h, "color-r": c.r, "color-g": c.g,
                "color-b": c.b, "color-a": c.a, "stroke-r": stroke.r, "stroke-g": stroke.g,
                "stroke-b": stroke.b, "stroke-a": stroke.a, "stroke-w": stroke.w}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)
    return int(ret[2:])


def drawPolygon(numberOfPoints, xArray, yArray):
    sendData = {'action': "draw", "shape": "polygon", "x-array": xArray, "y-array": yArray, "points": numberOfPoints,
                "color-r": c.r, "color-g": c.g,
                "color-b": c.b, "color-a": c.a, "stroke-r": stroke.r, "stroke-g": stroke.g,
                "stroke-b": stroke.b, "stroke-a": stroke.a, "stroke-w": stroke.w}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)
    return int(ret[2:])


def putText(x, y, stringContext, size):
    sendData = {'action': "add", "object": "label", "x": x, "y": y, "str": stringContext, "color-r": c.r,
                "color-g": c.g,
                "color-b": c.b, "color-a": c.a, "size": size}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)
    return int(ret[2:])


def putButton(x, y, w, h, stringContext):
    sendData = {'action': "add", "object": "button", "str": stringContext, "x": x, "y": y, "w": w, 'h': h}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)
    return int(ret[2:])


def putImage(x, y, w, h, pathString):
    sendData = {'action': "add", "object": "image", "path": pathString, "x": x, "y": y, "w": w, 'h': h}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)
    return int(ret[2:])


def putInputBox(x, y, w, h, type_='text'):
    sendData = {'action': "add", "object": "input", "x": x, "y": y, "w": w, 'h': h, 'type': type_}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)
    return int(ret[2:])


def showChooseDialog(title, stringContext, options):
    sendData = {'action': "show", "object": "dialog", "title": title, "str": stringContext, "option": options}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)
    return int(ret[2:])


def chooseFile():
    sendData = {'action': "show", "object": "filechooser"}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)
    return ret[2:]


def changeText(id, stringContext):
    sendData = {'action': "change", "object": "str", "id": id, "str": stringContext}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)


def changePath(id, stringContext):
    sendData = {'action': "change", "object": "path", "id": id, "str": stringContext}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)


def changePosition(id, x, y):
    sendData = {'action': "change", "object": "position", "id": id, "x": x, "y": y}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)


def getText(id):
    sendData = {'action': "get", "object": "str", "id": id}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)
    return ret[2:]


def executeJs(code):
    sendData = {'action': "execute", "code": code}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)
    return ret[2:]


def removeByID(id):
    sendData = {'action': "delete", "id": id}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)


def waitForClick():
    sendData = {'action': "get", "object": "wait-click"}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)
    return int(ret[2:])


def waitForClickXy():
    sendData = {'action': "get", "object": "wait-click-xy"}
    ret = sendDict(sendData)
    if verboseMode:
        print(ret)
    return re.findall(r"\d+\.?\d*", ret)


def closeDrawer():
    try:
        sendData = {'action': "exit"}
        ret = sendDict(sendData)
        if verboseMode:
            print(ret)
        time.sleep(1)
        sock.close()
    finally:
        exit(0)
