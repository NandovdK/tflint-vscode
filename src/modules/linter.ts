import { exec } from 'child_process';
import { TFLintResult } from '../models/tflint';
import { logger } from '../helpers/logger';
import { ExtensionConfiguration } from '../settings';

export async function run(config: ExtensionConfiguration, pathToLint: string, fix: boolean): Promise<TFLintResult> {
    const extraOptions: string[] = [];

    if (config.configFilePath) {
        extraOptions.push(`--config ${config.configFilePath}`);
    }

    if (fix) {
        extraOptions.push("--fix");
    }

    const binPath = config.binPath || "tflint";
    return new Promise((resolve, reject) => {

        const cmd = [
            binPath,
            `--chdir ${pathToLint}`,
            "--recursive",
            "--format json",
            "--force",
            ...extraOptions
        ].join(" ");

        logger.debug(`Executing cmd: ${cmd}`);
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


