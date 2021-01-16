package xianfei.fxDrawer;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

public class Main implements Constant{
    private static int port = 6666;
    private static int afterRunKillPID = -1;
    private static boolean verbose = true;

    public static void main(String[] args) {
        // 对启动参数进行处理
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
        if (verbose) System.out.println(versionInfo);
        if (verbose) System.out.println(System.getProperties());
        new Thread(() -> {
            try {
                ServerSocket serverSocket = new ServerSocket(port);
                Socket s = serverSocket.accept();
                DataInputStream dis = new DataInputStream(s.getInputStream());
                DataOutputStream dos = new DataOutputStream(s.getOutputStream());
                GUIParser GUIParser = new GUIParser(verbose,afterRunKillPID);
                if (verbose) System.out.println("Java FX: " + s.getRemoteSocketAddress());
                while (true) {
                    String str = readUTF8(dis);
                    if (verbose) System.out.println("Java FX received: " + str);
                    GUIParser.parse(str);
                    dos.writeUTF("ok" + GUIParser.backStr);
                }
//                serverSocket.close();
            } catch (IOException e) {
                if (verbose) e.printStackTrace();
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
