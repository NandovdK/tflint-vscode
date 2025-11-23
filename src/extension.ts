import * as vscode from 'vscode';
import * as linter from './modules/linter';
import * as diagnostics from './modules/diagnostics';

const collection = vscode.languages.createDiagnosticCollection("tflint");

export function activate(context: vscode.ExtensionContext) {

    const workspace = vscode.workspace.workspaceFolders;
    if (workspace !== undefined) {
        console.log("[TFLint]: linting project on startup");
        lintOnPath(workspace[0].uri.path);
    }

    let disposable = vscode.commands.registerCommand("extension.lint", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.log("no editor");
            return;
        }

        lintOnFile(editor.document);
    }
    );

    context.subscriptions.push(disposable);
}
async function lintOnPath(pathToLint: string) {
    console.log("[TFLint]: Path to lint:" + pathToLint);
    const result = await linter.run(pathToLint);
    diagnostics.publish(collection, result);

}
async function lintOnFile(document: vscode.TextDocument) {

    const workspace = vscode.workspace.getWorkspaceFolder(document.uri);
    if (workspace === undefined) {
        return;
    }
    const pathToLint = workspace.uri.path;

    console.log("[TFLint]: Path to lint:" + pathToLint);
    const result = await linter.run(pathToLint);
    diagnostics.publish(collection, result);
}

// This method is called when your extension is deactivated
export function deactivate() { }


