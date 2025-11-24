import * as vscode from 'vscode';
import { config, searchFileInWorkspace } from './helpers/vscode';
import { getAbsoluteFilePath, checkIfFileExists } from './helpers/file';

export interface ExtensionConfiguration {
    binPath?: string
    configFilePath?: string
    fixOnSave: boolean
}

export async function loadConfig() {
    const workspace = config("tflint-vscode");
    const binPath = workspace.get<string>("tfLintBinPath") || undefined;
    const fixOnSave = workspace.get<boolean>("fixOnSave") || false;
    let configFilePath = workspace.get<string>("configFile") || await searchFileInWorkspace(".tflint.hcl");

    if (configFilePath) {
        configFilePath = getAbsoluteFilePath(configFilePath);

        if (!checkIfFileExists(configFilePath)) {
            vscode.window.showErrorMessage(`Configured tflint config file could not be found at: ${configFilePath}`);
        }
    } else {
        vscode.window.showWarningMessage("Could not find tflint config file, please configure this for optimal performance: tflint-vscode.configFile");
    }

    if (binPath && !checkIfFileExists(binPath)) {
        vscode.window.showErrorMessage(`Configured tflint bin could not be found at: ${configFilePath}`);
    }

    const configuration: ExtensionConfiguration = {
        configFilePath: configFilePath,
        binPath: binPath,
        fixOnSave: fixOnSave
    };

    return configuration;
}
