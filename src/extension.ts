import * as vscode from 'vscode';
import { runTFLint } from './modules/linter';
import { publish } from './modules/diagnostics';

const collection = vscode.languages.createDiagnosticCollection("tflint");

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand("extension.lint", () => {
        console.log("hello from extension");
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.log("no editor");
            return;
        }

        lint(editor.document);
    }
    );

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

async function lint(document: vscode.TextDocument) {
    const result = await runTFLint("");
    publish(collection, document, result);
}
