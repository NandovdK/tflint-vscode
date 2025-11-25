import * as vscode from 'vscode';
import { config, searchFileInWorkspace } from './helpers/vscode';
import { getAbsoluteFilePath, checkIfFileExists } from './helpers/file';
import { initialize } from './modules/linter';

export interface ExtensionConfiguration {
    binPath?: string
    configFilePath?: string
    fixOnSave: boolean
}

export async function loadConfig(): Promise<ExtensionConfiguration> {
    const workspace = config("tflint-vscode");
    const binPath = workspace.get<string>("tfLintBinPath") || "tflint";
    const fixOnSave = workspace.get<boolean>("fixOnSave") || false;
    let configFilePath = workspace.get<string>("configFile") || await searchFileInWorkspace(".tflint.hcl");

    if (configFilePath) {
        configFilePath = getAbsoluteFilePath(configFilePath);

        if (!checkIfFileExists(configFilePath)) {
            vscode.window.showErrorMessage(`Configured tflint config file could not be found at: ${configFilePath}`);
        }
    }

    const configuration: ExtensionConfiguration = {
        configFilePath: configFilePath,
        binPath: binPath,
        fixOnSave: fixOnSave
    };

    if (!configFilePath) {
        return configuration;
    }
    const result = await initialize(configuration);

    if (!result) {
        vscode.window.showErrorMessage("Unable to initialize tflint correctly. Please check logs for more information");
        return configuration;
    } else {
        return configuration;
    }
}
