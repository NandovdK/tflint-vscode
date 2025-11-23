import { exec } from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import { TFLintResult } from '../models/tflint';
import { log } from './logger';

var tfLintConfigFilePath: string | null = null;


export async function run(pathToLint: string, fix: boolean): Promise<TFLintResult> {
    const extraOptions: string[] = [];

    if (tfLintConfigFilePath !== null) {
        extraOptions.push(`--config ${tfLintConfigFilePath}`);
    }

    if (fix) {
        extraOptions.push("--fix");
    }
    return new Promise((resolve, reject) => {

        const cmd = [
            "tflint",
            `--chdir ${pathToLint}`,
            "--recursive",
            "--format json",
            "--force",
            ...extraOptions
        ].join(" ");

        log(`Executing cmd: ${cmd}`);
        exec(cmd, (err, stdout, stderr) => {

            if (err) {
                reject(err);
                return;
            }

            try {
                const result: TFLintResult = JSON.parse(stdout);
                resolve(result);
            } catch (e) {
                console.error("[TFLint] JSON parse error:", e);
                reject(e);
            }
        });
    });
}

// should be an optional setting in settings.json
export async function loadConfig() {
    const config = vscode.workspace.getConfiguration("tflint-vscode");
    let configFile = config.get<string>("configFile") || null;

    if (configFile) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            console.warn("[TFLint] No workspace folder found");
            return null;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const fullPath = path.isAbsolute(configFile) ? configFile : path.join(rootPath, configFile);
        tfLintConfigFilePath = fullPath;

        log(`Found config file: ${fullPath}`);
        return;
    }
    const files = await vscode.workspace.findFiles("**/.tflint.hcl", "**/.terraform/**", 1);

    if (files.length === 1) {
        log(`Found config file at ${files[0].path}`);
        tfLintConfigFilePath = files[0].path;
        return;
    }
    log("Could not find .tflint.hcl file in current workspace");
    tfLintConfigFilePath = null;
}
