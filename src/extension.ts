import * as vscode from 'vscode';
import * as linter from './modules/linter';
import { diagnostics } from './modules/diagnostics';
import { loadConfig, ExtensionConfiguration } from './settings';
import { getAllWorkspacePaths } from './helpers/vscode';
import path from 'path';

let initConfig: ExtensionConfiguration;

export async function activate(context: vscode.ExtensionContext) {
    loadConfig().then(async (config) => {
        initConfig = config;
        const workspaces = getAllWorkspacePaths();
        if (workspaces.length > 0) {
            await lintOnPaths(workspaces);
        }


    });

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("tflint-vscode")) {
                vscode.window.showWarningMessage(
                    "You should restart VS Code for configuration changes to take effect",
                );
            }
        }),
    );

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async (document) => {
            if (!document.fileName.endsWith(".tf")) {
                return;
            }

            diagnostics.collection.set(document.uri, []);
            await lintOnFile(document, initConfig.fixOnSave);
        }));

    context.subscriptions.push(
        vscode.commands.registerCommand("extension.lint", async () => {
            const workspaces = getAllWorkspacePaths();
            if (workspaces.length > 0) {
                await lintOnPaths(workspaces);
            }
            vscode.window.showInformationMessage("Project linted");
        }));



    context.subscriptions.push(
        vscode.commands.registerCommand("extension.lint-fix", async () => {
            const workspaces = getAllWorkspacePaths();
            if (workspaces.length > 0) {
                await lintOnPaths(workspaces);
            }

            vscode.window.showInformationMessage("Project linted & auto fixed");
        }));
};


async function lintOnPaths(pathsToLint: string[], withFix: boolean = false) {
    for (var pathToLint of pathsToLint) {
        const result = await linter.run(initConfig, pathToLint, withFix);
        diagnostics.publish(result);
    }

}
async function lintOnFile(document: vscode.TextDocument, withFix: boolean = false) {
    const pathToLint = path.dirname(document.uri.path);
    await lintOnPaths([pathToLint], withFix);
}

// This method is called when your extension is deactivated
export function deactivate() { }


