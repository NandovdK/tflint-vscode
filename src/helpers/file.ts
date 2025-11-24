import path from 'path';
import * as vscode from 'vscode';
import { logger } from '../helpers/logger';

export function getAbsoluteFilePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
        return filePath;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        logger.warn("[TFLint] No workspace folder found");
        return "";
    }
    return path.join(workspaceFolders[0].uri.fsPath, filePath);
}
