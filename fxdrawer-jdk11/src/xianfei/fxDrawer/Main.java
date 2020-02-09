package xianfei.fxDrawer;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Optional;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.scene.Group;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Polygon;
import javafx.scene.shape.Rectangle;
import javafx.scene.text.Font;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import com.alibaba.fastjson.*;



public class Main extends Application {
    private static int port = 6666;
    private static int afterRunKillPID = -1;
    private static boolean verbose = true;
    private static int argsNum;

    public static void main(String[] args) {
        // 对启动参数进行处理
        argsNum = args.length;
        for (int i = 0; i < args.length; i++) {
            if (args[i].equals("-port")) {
                port = Integer.parseInt(args[++i]);
            }
            if (args[i].equals("-kill")) {
                afterRunKillPID = Integer.parseInt(args[++i]);
            }
            if (args[i].equals("-verbose")) {
                verbose = Boolean.parseBoolean(args[++i]);
            }
        }
        if (verbose) System.out.println("fxDraw by xianfei v0.0.5");
        if (verbose) System.out.println(System.getProperties());
        launch(args);
    }

    @Override
    public void start(final Stage stage) {
        Group g = new Group();

        // 点击关闭按钮的操作
        stage.setOnCloseRequest(event -> {
            if (verbose) System.out.print("Java FX: closed by closed window.");
            try {
                // 关闭启动时接受参数的-kill的PID
                if (afterRunKillPID >= 0) Runtime.getRuntime().exec("taskkill /F /PID " + afterRunKillPID);
            } catch (IOException e) {
                e.printStackTrace();
            }
            System.exit(0);
        });
        if(argsNum == 0){
            new Thread(()->{
                Platform.runLater(()-> {
                    Alert alert = new Alert(Alert.AlertType.INFORMATION);
                    alert.setTitle("fxDrawer by xianfei 0.0.5");
                    alert.setHeaderText(null);
                    alert.setContentText("这是fxDrawer图形库解释器核心执行程序，如非进行相关开发测试，请勿直接运行或删除这些文件。");
                    alert.showAndWait();
                    System.exit(0);
                });
            }).start();
        }
        new Thread(() -> {
            try {
                ServerSocket serverSocket = new ServerSocket(port);
                Socket s = serverSocket.accept();
                HashMap<Integer, Node> list = new HashMap<>();
                int lastID = 2110; // 我的学号后四位 可以改成你喜欢的数字
                int[] lastClick = new int[1];
                lastClick[0] = -1;
                DataInputStream dis = new DataInputStream(s.getInputStream());
                DataOutputStream dos = new DataOutputStream(s.getOutputStream());
                if (verbose) System.out.println("Java FX: " + s.getRemoteSocketAddress());
                while (true) {
                    String str = readUTF8(dis);
                    StringBuilder backMsg = new StringBuilder();
                    if (verbose) System.out.println("Java FX received: " + str);
                    JSONObject jsonObj = JSONObject.parseObject(str);
                    switch (jsonObj.getString("action")) {
                        case "init": {
                            Platform.runLater(() -> {
                                Scene scene = new Scene(g, jsonObj.getIntValue("width"), jsonObj.getIntValue("height"));
                                stage.setScene(scene);
                                stage.show();
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
                                    if (list.get(jsonObj.getInteger("id")) instanceof Label)
                                        backMsg.append(((Label) (list.get(jsonObj.getInteger("id")))).getText());
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
                                    int []sema = new int[1];
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
                                    int []sema = new int[1];
                                    sema[0]=-1;
                                    Platform.runLater(() -> {
                                        String []opts = jsonObj.getString("option").split("\\|");
                                        Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
                                        alert.setTitle(jsonObj.getString("title"));
                                        alert.setHeaderText(null);
                                        alert.setContentText(jsonObj.getString("str"));
                                        ButtonType []buts=new ButtonType[opts.length+1];
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
                                        if (list.get(jsonObj.getInteger("id")) instanceof Label)
                                            ((Label)((list.get(jsonObj.getInteger("id"))))).setText(jsonObj.getString("str"));
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
                                    Label label = new Label(jsonObj.getString("str"));
                                    label.setFont(Font.font(jsonObj.getDoubleValue("size"))); // Please, I want to see this text!
                                    label.setTextFill(Color.rgb(jsonObj.getIntValue("color-r"), jsonObj.getIntValue("color-g"),
                                            jsonObj.getIntValue("color-b"), jsonObj.getDoubleValue("color-a")));
                                    label.setLayoutX(jsonObj.getIntValue("x"));
                                    label.setLayoutY(jsonObj.getIntValue("y"));
                                    label.setMinWidth(1000);
                                    Platform.runLater(() -> {
                                        g.getChildren().add(label);
                                    });
                                    list.put(lastID, label);
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
                            switch (jsonObj.getString("shape")) {
                                case "circle": {
                                    Circle c = new Circle();
                                    c.setFill(Color.rgb(jsonObj.getIntValue("color-r"), jsonObj.getIntValue("color-g"),
                                            jsonObj.getIntValue("color-b"), jsonObj.getDoubleValue("color-a")));
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
                                    r.setFill(Color.rgb(jsonObj.getIntValue("color-r"), jsonObj.getIntValue("color-g"),
                                            jsonObj.getIntValue("color-b"), jsonObj.getDoubleValue("color-a")));
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
                                    r.setFill(Color.rgb(jsonObj.getIntValue("color-r"), jsonObj.getIntValue("color-g"),
                                            jsonObj.getIntValue("color-b"), jsonObj.getDoubleValue("color-a")));
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
                    dos.writeUTF("ok" + backMsg.toString());
                }
//                serverSocket.close();
            } catch (IOException e) {
                if (verbose) e.printStackTrace();
                Platform.runLater(() -> {
                    stage.close();
                });
            }
        }).start();
    }

    private static String readUTF8(InputStream in) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        int num = in.read() * 256;
        num += in.read();
        for (int i = 0; i < num; i++) {
            int b = in.read();
            if (b < 0) {
                throw new IOException("Data truncated");
            }
            buffer.write(b);
        }
        return new String(buffer.toByteArray(), StandardCharsets.UTF_8);
    }
}
