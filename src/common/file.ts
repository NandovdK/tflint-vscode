import path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import { logger } from "../common/logger";

export function getAbsoluteFilePath(filePath: string): string {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    logger.warn("No workspace folder found");
    return "";
  }
  return path.join(workspaceFolders[0].uri.fsPath, filePath);
}

export function checkIfFileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
