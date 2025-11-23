import { exec } from 'child_process';
import * as vscode from 'vscode';
import { TFLintResult } from '../models/tflint';

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
    const files = await vscode.workspace.findFiles("**/.tflint.hcl", null, 1);

    if (files.length === 1) {
        console.log("[TFLint]: Found config file at", files[0].path);
        tfLintConfigFilePath = files[0].path;
        return;
    }
    console.log("[TFLint]: Could not find .tflint.hcl file in current workspace");
    tfLintConfigFilePath = null;
}
