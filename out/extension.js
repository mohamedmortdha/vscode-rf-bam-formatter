"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const RobotFormatProvider_1 = require("./provider/format-provider/RobotFormatProvider");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    vscode.languages.registerDocumentFormattingEditProvider('robot', new RobotFormatProvider_1.RobotFormatProvider());
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map