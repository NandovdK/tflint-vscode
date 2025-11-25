import { exec } from 'child_process';
import { TFLintResult } from '../models/tflint';
import { logger } from '../helpers/logger';
import { ExtensionConfiguration } from '../settings';
import { dirname } from 'path';

export async function run(config: ExtensionConfiguration, pathToLint: string, fix: boolean): Promise<TFLintResult> {
    const extraOptions: string[] = [];

    if (config.configFilePath) {
        extraOptions.push(`--config ${config.configFilePath}`);
    }

    if (fix) {
        extraOptions.push("--fix");
    }

    return new Promise((resolve, reject) => {

        const cmd = [
            config.binPath,
            `--chdir ${pathToLint}`,
            "--recursive",
            "--format json",
            "--force",
            ...extraOptions
        ].join(" ");

        logger.debug(`[TFLint]: Executing cmd: ${cmd}`);
        exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, _) => {

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

export async function initialize(config: ExtensionConfiguration): Promise<boolean> {
    if (!config.configFilePath) {
        return false;
    }
    const dir = dirname(config.configFilePath);
    if (!dir) {
        return false;
    }
    const cmd = `${config.binPath} --chdir ${dir} --init`;
    logger.debug(`[TFLINT]: running cmd: ${cmd}`);

    exec(cmd, (err, _, __) => {
        if (err) {
            logger.error("[TFLINT]: --init failed");
            return false;
        }
    });

    logger.debug("[TFLint]: --init success");
    return true;
}
