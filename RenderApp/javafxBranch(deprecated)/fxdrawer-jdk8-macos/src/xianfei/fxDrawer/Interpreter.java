package xianfei.fxDrawer;

public class Interpreter {

    GUIParser parser;

    public Interpreter(GUIParser parser) {
        this.parser = parser;
    }

    void input(String str){
        if(str==null)throw new IllegalArgumentException("Input is null.");
        String[] strings = str.split(" ");
        // init 800x600
        switch (strings[0]){
            case "init":
                parser.parse("{\"action\": \"init\", \"width\": "+ strings[1] +", \"height\": "+strings[2]+"}");
                break;
            case "draw":
                switch (strings[1]){
                    case "circle":
                    case "rectangle":
                    case "polygon":
                }
                break;
        }
    }
}
