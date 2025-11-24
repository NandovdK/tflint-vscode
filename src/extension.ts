import * as vscode from 'vscode';
import * as linter from './modules/linter';
import * as diagnostics from './modules/diagnostics';
import { logger } from './helpers/logger';
import { loadConfig, ExtensionConfiguration } from './settings';
import { getProjectRoot } from './helpers/vscode';

import path from 'path';

const collection = vscode.languages.createDiagnosticCollection("TFLint");
let initConfig: ExtensionConfiguration;

export async function activate(context: vscode.ExtensionContext) {
    loadConfig().then(async (config) => {
        initConfig = config;
        const projectPath = getProjectRoot();
        if (projectPath) {
            await lintOnPath(projectPath);
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

            collection.set(document.uri, []);
            await lintOnFile(document, initConfig.fixOnSave);
        }));

    context.subscriptions.push(
        vscode.commands.registerCommand("extension.lint", async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }

            await lintOnFile(editor.document).then(() => {
                vscode.window.showInformationMessage("Project linted");
            }
            );

        }));


    context.subscriptions.push(
        vscode.commands.registerCommand("extension.lint-fix", async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }

            await lintOnFile(editor.document, true).then(() => {
                vscode.window.showInformationMessage("Project linted & auto fixed");
            });
        }
        ));


}
async function lintOnPath(pathToLint: string, withFix: boolean = false) {
    logger.debug("Path to lint:" + pathToLint);

    const result = await linter.run(initConfig, pathToLint, withFix);
    diagnostics.publish(collection, result);

}
async function lintOnFile(document: vscode.TextDocument, withFix: boolean = false) {
    const pathToLint = path.dirname(document.uri.path);
    await lintOnPath(pathToLint, withFix);
}

// This method is called when your extension is deactivated
export function deactivate() { }


