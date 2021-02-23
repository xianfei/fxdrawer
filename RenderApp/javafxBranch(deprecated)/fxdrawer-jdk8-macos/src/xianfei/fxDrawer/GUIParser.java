package xianfei.fxDrawer;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Optional;
import com.madeorsk.emojisfx.EmojisLabel;
import com.sun.javafx.application.PlatformImpl;
import com.alibaba.fastjson.*;
import javafx.application.Platform;
import javafx.scene.Group;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Polygon;
import javafx.scene.shape.Rectangle;
import javafx.scene.text.Font;
import javafx.stage.FileChooser;
import javafx.stage.Stage;
// for macOS touch bar support
import com.thizzer.jtouchbar.JTouchBar;
import com.thizzer.jtouchbar.common.*;
import com.thizzer.jtouchbar.item.*;
import com.thizzer.jtouchbar.item.view.*;
import com.thizzer.jtouchbar.item.view.action.TouchBarViewAction;
import com.thizzer.jtouchbar.javafx.JTouchBarJavaFX;
import com.thizzer.jtouchbar.scrubber.*;
import com.thizzer.jtouchbar.scrubber.view.*;

public class GUIParser implements Constant{

    Group g = new Group();
    HashMap<Integer, Node> list = new HashMap<>();
    // TouchBarItem
    HashMap<Integer, TouchBarItem> tbList = new HashMap<>();
    int lastID = 2110; // 我的学号后四位 可以改成你喜欢的数字
    int[] lastClick ={-1};
    boolean verbose;
    public String backStr;
    Stage stage;
    int afterRunKillPID;
    JTouchBar jTouchBar;

    public GUIParser(boolean verbose,int afterRunKillPID) {
        this.verbose = verbose;
        this.afterRunKillPID=afterRunKillPID;
    }

    private void close(){
        if (verbose) System.out.print("Java FX: closed by closed window.");
        try {
            // 关闭启动时接受参数的-kill的PID
            if (afterRunKillPID >= 0)
                if(System.getProperty("os.name").contains("indows"))Runtime.getRuntime().exec("taskkill /F /PID " + afterRunKillPID);
                else Runtime.getRuntime().exec("kill "+ afterRunKillPID);
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.exit(0);
    }

    public String parse(String str){
        JSONObject jsonObj = JSONObject.parseObject(str);
        StringBuilder backMsg = new StringBuilder();
        switch (jsonObj.getString("action")) {
            case "init": {
                PlatformImpl.startup(() -> {
                    stage = new Stage();
                    Scene scene = new Scene(g, jsonObj.getIntValue("width"), jsonObj.getIntValue("height"));
                    jTouchBar = new JTouchBar();
                    jTouchBar.setCustomizationIdentifier("MyJavaFXJavaTouchBar");
                    TouchBarButton touchBarButtonImg = new TouchBarButton();
                    touchBarButtonImg.setTitle("Close");
                    touchBarButtonImg.setAction(view -> {
                        stage.close();
                        close();
                    });
                    jTouchBar.addItem(new TouchBarItem("Button_1", touchBarButtonImg, true));
                    TouchBarTextField touchBarTextField = new TouchBarTextField();
                    touchBarTextField.setStringValue(versionInfo);
                    jTouchBar.addItem(new TouchBarItem("TextField_1", touchBarTextField, true));
                    jTouchBar.addItem(new TouchBarItem(TouchBarItem.NSTouchBarItemIdentifierFlexibleSpace));
                    stage.setScene(scene);
                    stage.show();
                    JTouchBarJavaFX.show(jTouchBar, stage);
                    stage.setOnCloseRequest(event -> close());
                });
                break;
            }
            case "get": {
                switch (jsonObj.getString("object")) {
                    case "wait-click": {
                        lastClick[0] = -1;
                        try {
                            while (lastClick[0] == -1) Thread.sleep(10);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                        if (verbose) System.out.print("got click");
                        backMsg.append(lastClick[0]);
                        break;
                    }
                    case "str": {
                        if (list.get(jsonObj.getInteger("id")) instanceof VBox)
                            backMsg.append(((EmojisLabel) (((VBox) (list.get(jsonObj.getInteger("id")))).getChildren().get(0))).getText());
                        else if (list.get(jsonObj.getInteger("id")) instanceof Button)
                            backMsg.append(((Button) (list.get(jsonObj.getInteger("id")))).getText());
                        else if (list.get(jsonObj.getInteger("id")) instanceof TextArea)
                            backMsg.append(((TextArea) (list.get(jsonObj.getInteger("id")))).getText());
                        break;
                    }

                }
                break;
            }
            case "show": {
                switch (jsonObj.getString("object")) {
                    case "filechooser": {
                        int []sema = new int[1]; // 信号量？
                        sema[0]=-1;
                        Platform.runLater(() -> {
                            FileChooser fileChooser = new FileChooser();
                            File file = fileChooser.showOpenDialog(stage);
                            if (file != null) {
                                if (verbose) System.out.println(file.toString());
                                backMsg.append(file.toString());
                            }
                            sema[0]=0;
                        });
                        try {
                            while (sema[0] == -1) Thread.sleep(10);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                        break;
                    }
                    case "dialog": {
                        int []sema = new int[1]; // 信号量？
                        sema[0]=-1;
                        Platform.runLater(() -> {
                            String []opts = jsonObj.getString("option").split("\\|");
                            Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
                            alert.setTitle(jsonObj.getString("title"));
                            alert.setHeaderText(null);
                            alert.setContentText(jsonObj.getString("str"));
                            ButtonType[]buts=new ButtonType[opts.length+1];
                            buts[0] = new ButtonType("Cancel", ButtonBar.ButtonData.CANCEL_CLOSE);
                            for (int i = 1; i < buts.length; i++) {
                                buts[i] = new ButtonType(opts[i-1]);
                            }
                            alert.getButtonTypes().clear();
                            for (int i = 0; i < buts.length; i++) {
                                alert.getButtonTypes().add(buts[i]);
                            }
                            Optional<ButtonType> result = alert.showAndWait();
                            for (int i = 0; i < buts.length; i++) {
                                if (result.get() == buts[i])backMsg.append(i);
                            }
                            sema[0]=0;
                        });
                        try {
                            while (sema[0] == -1) Thread.sleep(10);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                        break;
                    }

                }
                break;
            }
            case "change": {
                switch (jsonObj.getString("object")) {
                    case "str":
                        Platform.runLater(() -> {
                            if (list.get(jsonObj.getInteger("id")) instanceof VBox)
                                ((EmojisLabel) (((VBox) (list.get(jsonObj.getInteger("id")))).getChildren().get(0))).setText(jsonObj.getString("str"));
                            else if (list.get(jsonObj.getInteger("id")) instanceof Button)
                                ((Button) (list.get(jsonObj.getInteger("id")))).setText(jsonObj.getString("str"));
                            else if (list.get(jsonObj.getInteger("id")) instanceof TextArea)
                                ((TextArea) (list.get(jsonObj.getInteger("id")))).setText(jsonObj.getString("str"));
                        });
                        break;
                    case "path":
                        Platform.runLater(() -> {
                            if (list.get(jsonObj.getInteger("id")) instanceof ImageView)
                                ((ImageView) (list.get(jsonObj.getInteger("id")))).setImage(new Image(new File(jsonObj.getString("str")).toURI().toString()));
                        });
                        break;
                    case "position":
                        Platform.runLater(() -> {
                            (list.get(jsonObj.getInteger("id"))).setLayoutX(jsonObj.getIntValue("x"));
                            (list.get(jsonObj.getInteger("id"))).setLayoutY(jsonObj.getIntValue("y"));
                        });
                        break;
                }
                break;
            }
            case "delete": {
                Platform.runLater(() -> {
                    g.getChildren().remove(list.get(jsonObj.getInteger("id")));
                    if (list.get(jsonObj.getInteger("id")) instanceof Button)
                        jTouchBar.getItems().remove(tbList.get(jsonObj.getInteger("id")));
                    list.remove(jsonObj.getInteger("id"));
                });
                break;
            }
            case "add": {
                switch (jsonObj.getString("object")) {
                    case "image": {
                        ImageView img = new ImageView(new Image(new File(jsonObj.getString("path")).toURI().toString()));
                        if (verbose)
                            System.out.println(new File(jsonObj.getString("path")).toURI().toString());
                        img.setLayoutX(jsonObj.getIntValue("x"));
                        img.setLayoutY(jsonObj.getIntValue("y"));
                        img.setFitHeight(jsonObj.getIntValue("h"));
                        img.setFitWidth(jsonObj.getIntValue("w"));
                        int finalLastID = lastID;
                        img.setOnMouseClicked(event -> {
                            lastClick[0] = finalLastID;
                        });
                        Platform.runLater(() -> {
                            g.getChildren().add(img);
                        });
                        list.put(lastID, img);
                        backMsg.append(lastID);
                        lastID++;
                    }
                    break;
                    case "button": {
                        Button but = new Button(jsonObj.getString("str"));
                        but.setLayoutX(jsonObj.getIntValue("x"));
                        but.setLayoutY(jsonObj.getIntValue("y"));
                        but.setMinSize(jsonObj.getIntValue("w"), jsonObj.getIntValue("h"));
                        but.setMaxSize(jsonObj.getIntValue("w"), jsonObj.getIntValue("h"));
                        int finalLastID = lastID;
                        but.setOnAction(event -> {
                            lastClick[0] = finalLastID;
                        });
                        Platform.runLater(() -> {
                            g.getChildren().add(but);
                        });
                        list.put(lastID, but);
                        TouchBarButton touchBarButton = new TouchBarButton();
                        touchBarButton.setTitle(jsonObj.getString("str"));
                        touchBarButton.setAction(view -> {
                            lastClick[0] = finalLastID;
                        });
                        TouchBarItem touchBarItem = new TouchBarItem("Button"+lastID, touchBarButton, true);
                        jTouchBar.getItems().add(0,touchBarItem);
                        tbList.put(lastID,touchBarItem);
                        backMsg.append(lastID);
                        lastID++;
                    }
                    break;
                    case "input": {
                        TextArea textA = new TextArea();
                        textA.setText(jsonObj.getString("str"));
                        textA.setLayoutX(jsonObj.getIntValue("x"));
                        textA.setLayoutY(jsonObj.getIntValue("y"));
                        textA.setMinSize(jsonObj.getIntValue("w"), jsonObj.getIntValue("h"));
                        textA.setMaxSize(jsonObj.getIntValue("w"), jsonObj.getIntValue("h"));
                        Platform.runLater(() -> {
                            g.getChildren().add(textA);
                        });
                        list.put(lastID, textA);
                        backMsg.append(lastID);
                        lastID++;
                    }
                    break;
                    case "label": {
//                                    Platform.runLater(() -> {
                        EmojisLabel label = new EmojisLabel(jsonObj.getString("str"));
                        label.setFont(Font.font(jsonObj.getDoubleValue("size"))); // Please, I want to see this text!
                        label.setTextFill(Color.rgb(jsonObj.getIntValue("color-r"), jsonObj.getIntValue("color-g"),
                                jsonObj.getIntValue("color-b"), jsonObj.getDoubleValue("color-a")));
                        VBox box = new VBox();
                        box.setStyle("-fx-background-color:rgb(0,0,0,0)");
                        box.setLayoutX(jsonObj.getIntValue("x"));
                        box.setLayoutY(jsonObj.getIntValue("y"));
                        box.setMinWidth(1000);
                        box.getChildren().add(label);
                        Platform.runLater(() -> {
                            g.getChildren().add(box);
                        });
                        list.put(lastID, box);
                        backMsg.append(lastID);
                        lastID++;
//                                        g.getChildren().add(label);
//                                        Text text = new Text(jsonObj.getIntValue("x"), jsonObj.getIntValue("y"), jsonObj.getString("str"));
//                                        text.setFill(Color.rgb(jsonObj.getIntValue("color-r"), jsonObj.getIntValue("color-g"),
//                                                jsonObj.getIntValue("color-b"), jsonObj.getDoubleValue("color-a")));
//                                        text.setFont(Font.font(jsonObj.getDoubleValue("size")));
//                                        g.getChildren().add(text);
//                                    });
                    }
                    break;
                }
            }
            break;
            case "draw": {
                Color fillColor = Color.rgb(jsonObj.getIntValue("color-r"), jsonObj.getIntValue("color-g"),
                        jsonObj.getIntValue("color-b"), jsonObj.getDoubleValue("color-a"));
                Color strokeColor = null;
                double strokeWidth = 1.0;
                boolean needDrawStroke = false;
                if(jsonObj.containsKey("stroke-r"))needDrawStroke = true;
                if(jsonObj.getDoubleValue("stroke-a")==0.0||jsonObj.getDoubleValue("stroke-w")==0.0)needDrawStroke = false;
                if(needDrawStroke) {
                    strokeColor = Color.rgb(jsonObj.getIntValue("stroke-r"), jsonObj.getIntValue("stroke-g"),
                            jsonObj.getIntValue("stroke-b"), jsonObj.getDoubleValue("stroke-a"));
                    strokeWidth = jsonObj.getDoubleValue("stroke-w");
                }
                switch (jsonObj.getString("shape")) {
                    case "circle": {
                        Circle c = new Circle();
                        c.setFill(fillColor);
                        if(needDrawStroke){
                            c.setStroke(strokeColor);
                            c.setStrokeWidth(strokeWidth);
                        }
                        c.setCenterX(jsonObj.getIntValue("x"));
                        c.setCenterY(jsonObj.getIntValue("y"));
                        c.setRadius(jsonObj.getIntValue("r"));
                        Platform.runLater(() -> {
                            g.getChildren().add(c);
                        });
                        list.put(lastID, c);
                        backMsg.append(lastID);
                        lastID++;
                    }
                    if (verbose) System.out.println("Java FX: show circle");
                    break;
                    case "rectangle": {
                        Rectangle r = new Rectangle();
                        r.setX(jsonObj.getIntValue("x"));
                        r.setY(jsonObj.getIntValue("y"));
                        r.setWidth(jsonObj.getIntValue("w"));
                        r.setHeight(jsonObj.getIntValue("h"));
                        r.setFill(fillColor);
                        if(needDrawStroke){
                            r.setStroke(strokeColor);
                            r.setStrokeWidth(strokeWidth);
                        }
                        Platform.runLater(() -> {
                            g.getChildren().add(r);
                        });
                        list.put(lastID, r);
                        backMsg.append(lastID);
                        lastID++;
                    }
                    if (verbose) System.out.println("Java FX: show rectangle");
                    break;
                    case "polygon": {
                        Polygon r = new Polygon();

                        Double[] points = new Double[jsonObj.getIntValue("points") * 2];
                        for (int i = 0; i < jsonObj.getIntValue("points") * 2; i += 2) {
                            points[i] = jsonObj.getJSONArray("x-array").getDouble(i / 2);
                            points[i + 1] = jsonObj.getJSONArray("y-array").getDouble(i / 2);
                        }
                        r.getPoints().addAll(points);
                        r.setFill(fillColor);
                        if(needDrawStroke){
                            r.setStroke(strokeColor);
                            r.setStrokeWidth(strokeWidth);
                        }
                        Platform.runLater(() -> {
                            g.getChildren().add(r);
                        });
                        list.put(lastID, r);
                        backMsg.append(lastID);
                        lastID++;
                    }
                    if (verbose) System.out.println("Java FX: show polygon");
                    break;
                }
            }
            break;
            case "exit":
                Platform.runLater(() -> {
                    stage.close();
                });
                if (verbose) System.out.println("Java FX: closed by c side");
                System.exit(0);
                break;
        }
        backStr = backMsg.toString();
        return backStr;
    }
}
