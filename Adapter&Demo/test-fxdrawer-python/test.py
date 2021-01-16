from fxdrawer.adapter import *

initDrawer(700, 400)
setColor(24, 138, 255, 0.5)
label1ID = putText(400, 50, "Hello 你好😆\n这是一个图形库的Demo", 16)
setColor(255, 0, 0, 0.3)
circleID = drawCircle(150, 150, 50)
setColor(0, 255, 0, 0.3)
label2ID = putText(400, 300, "Hello 你好😆\n这是一个图形库的Demo", 16)
setStroke(244, 0, 0, 0.9, 1.8)  # 描边  r g b a 宽度
rectID = drawRectangle(120, 150, 40, 80)
setColor(0, 0, 255, 0.0)
setStroke(0, 244, 200, 0.9, 3)  # 描边  r g b a 宽度
xPoints = [200, 200, 400]
yPoints = [200, 300, 300]  # 顶点坐标数组
triaID = drawPolygon(3, xPoints, yPoints)  # 三角形
changeText(label1ID, "点击按钮十次退出程序\n点击三次删除圆形\n点击五次删除矩形\n点击七次删除三角形")
butID = putButton(400, 220, 100, 30, "测试按钮")
butID2 = putButton(510, 220, 100, 30, "读取输入")
inputID = putInputBox(400, 180, 220, 30)
counter = 0
while True:
    clicked = waitForClick()
    if (clicked == butID):
        counter += 1
        changeText(label2ID, "您点击了按钮" + str(counter) + "次")
    if (clicked == butID2):
        changeText(label2ID, "您输入了" + getText(inputID))
        # showChooseDialog("提示", "您输入了" + getText(inputID), "OK")
    if (counter == 10): break
    if (counter == 3): removeByID(circleID)
    if (counter == 5): removeByID(rectID)
    if (counter == 7): removeByID(triaID)
closeDrawer()
