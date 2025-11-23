import * as vscode from 'vscode';
import * as linter from './modules/linter';
import * as diagnostics from './modules/diagnostics';
import { log } from './modules/logger';

const collection = vscode.languages.createDiagnosticCollection("TFLint");

export async function activate(context: vscode.ExtensionContext) {
    linter.loadConfig().then(async () => {
        const workspace = vscode.workspace.workspaceFolders;
        if (workspace !== undefined) {
            log("linting project on startup");
            await lintOnPath(workspace[0].uri.path);
        }

    });


    const onSave = vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (!document.fileName.endsWith(".tf")) {
            return;
        }

        collection.set(document.uri, []);
        await lintOnFile(document);
    });

    context.subscriptions.push(onSave);

    let lintCommand = vscode.commands.registerCommand("extension.lint", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        await lintOnFile(editor.document);
    }
    );

    context.subscriptions.push(lintCommand);

    let lintWithFixCommand = vscode.commands.registerCommand("extension.lint-fix", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        await lintOnFile(editor.document, true);
    }
    );

    context.subscriptions.push(lintWithFixCommand);

}
async function lintOnPath(pathToLint: string, withFix: boolean = false) {
    log("Path to lint:" + pathToLint);

    const result = await linter.run(pathToLint, withFix);
    diagnostics.publish(collection, result);

}
async function lintOnFile(document: vscode.TextDocument, withFix: boolean = false) {

    const workspace = vscode.workspace.getWorkspaceFolder(document.uri);
    if (workspace === undefined) {
        return;
    }
    const pathToLint = workspace.uri.path;

    await lintOnPath(pathToLint, withFix);
}

// This method is called when your extension is deactivated
export function deactivate() { }


