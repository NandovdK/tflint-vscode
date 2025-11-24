import { config, searchFileInWorkspace } from './helpers/vscode';
import { getAbsoluteFilePath } from './helpers/file';

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
    }

    const configuration: ExtensionConfiguration = {
        configFilePath: configFilePath,
        binPath: binPath,
        fixOnSave: fixOnSave
    };

    return configuration;
}
