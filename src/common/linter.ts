import { exec } from "child_process";
import { TFLintResult } from "../models/tflint";
import { logger } from "./logger";
import { ExtensionConfiguration } from "../settings";
import { dirname } from "path";

class Linter {
  private config: ExtensionConfiguration | null = null;

  async init(config: ExtensionConfiguration): Promise<void> {
    this.config = config;

    if (!config.configFilePath) {
      logger.debug("No config file path provided, skipping tflint --init");
      return;
    }

    const dir = dirname(config.configFilePath);
    if (!dir) {
      logger.debug("Invalid config directory, skipping tflint --init");
      return;
    }

    return new Promise((resolve, reject) => {
      const cmd = `${config.binPath} --chdir ${dir} --init`;
      logger.debug(`Running tflint --init: ${cmd}`);

      exec(cmd, (err) => {
        if (err) {
          logger.error("tflint --init failed");
          reject(err);
          return;
        }
        logger.debug("tflint --init success");
        resolve();
      });
    });
  }

  async run(pathToLint: string, fix: boolean): Promise<TFLintResult> {
    const options = this.buildTFLintOptions(fix);
    const cmd = this.buildCommand(pathToLint, options);

    return this.executeTFLint(cmd);
  }

  private buildTFLintOptions(fix: boolean): string[] {
    const options: string[] = [];

    if (this.config?.configFilePath) {
      options.push(`--config ${this.config.configFilePath}`);
    }

    if (fix) {
      options.push("--fix");
    }

    return options;
  }

  private buildCommand(pathToLint: string, options: string[]): string {
    return [
      this.config!.binPath,
      `--chdir ${pathToLint}`,
      "--recursive",
      "--format json",
      "--force",
      ...options,
    ].join(" ");
  }

  private executeTFLint(cmd: string): Promise<TFLintResult> {
    return new Promise((resolve, reject) => {
      logger.debug(`Executing: ${cmd}`);
      exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const result: TFLintResult = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          logger.error("[TFLint] JSON parse error:", e);
          reject(e);
        }
      });
    });
  }
}

export const linter: Linter = new Linter();
