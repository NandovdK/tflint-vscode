import * as vscode from 'vscode';
import { log } from '../modules/logger';

export function config(section: string): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(section);
}

export function getProjectRoot(): (string | undefined) {
    const workspace = vscode.workspace.workspaceFolders;
    if (workspace) {
        return workspace[0].uri.path;
    }
    return undefined;
}

export async function searchFileInWorkspace(fileName: string): Promise<string | undefined> {
    const files = await vscode.workspace.findFiles(`**/${fileName}`, `**/.terraform/**`, 1);

    if (files.length === 1) {
        log(`Found file at ${files[0].path}`);
        return files[0].path;
    }
    log(`Could not find file ${fileName} in current workspace`);
    return undefined;
}


