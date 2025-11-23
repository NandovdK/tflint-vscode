import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel("TFLint");

export function log(value: string) {
    outputChannel.appendLine(value);
}
