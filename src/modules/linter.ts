import { exec } from 'child_process';
import { TFLintResult } from '../models/tflint';

export function runTFLint(pathToLint: string): Promise<TFLintResult> {
    return new Promise((resolve, reject) => {
        exec(`tflint --chdir "/Users/nando/git/iac/src" --format json --force`, (err, stdout, stderr) => {

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

