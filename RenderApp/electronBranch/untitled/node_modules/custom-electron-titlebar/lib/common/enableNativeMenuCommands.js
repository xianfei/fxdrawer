"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableNativeMenuCommands = void 0;
const electron_1 = require("electron");
function enableNativeMenuCommands() {
    electron_1.ipcMain.on('execute-menu-command', (_, arg) => {
        const menu = electron_1.Menu.getApplicationMenu();
        if (menu !== null) {
            executeCommandByRole(arg.role, menu);
        }
    });
}
exports.enableNativeMenuCommands = enableNativeMenuCommands;
function executeCommandByRole(role, menu) {
    let index = 0;
    let done = false;
    while (done === false && index < menu.items.length) {
        const item = menu.items[index];
        if (item.role === role) {
            const focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
            const focusedWebContents = electron_1.webContents.getFocusedWebContents();
            item.click(undefined, focusedWindow, focusedWebContents);
            done = true;
        }
        else if (item.submenu) {
            done = executeCommandByRole(role, item.submenu);
        }
        index++;
    }
    return done;
}
//# sourceMappingURL=enableNativeMenuCommands.js.map