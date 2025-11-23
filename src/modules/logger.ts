import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel("TFLint");

export function log(value: string) {
    console.log(value);
    outputChannel.appendLine(value);
}
