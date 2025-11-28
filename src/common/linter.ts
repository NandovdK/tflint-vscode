import * as vscode from "vscode";
import { exec } from "child_process";
import { TFLintResult } from "../models/tflint";
import { logger } from "./logger";
import { ExtensionConfiguration } from "../settings";
import { dirname } from "path";

class Linter {
  private config: ExtensionConfiguration | null = null;
  private fileWatcher: vscode.FileSystemWatcher | null = null;

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

    this.createFileWatcher();

    return new Promise((resolve, reject) => {
      const cmd = `${config.binPath} --chdir ${dir} --init`;
      logger.debug(`Running cmd: ${cmd}`);

      exec(cmd, (err) => {
        if (err) {
          logger.error(`tflint init error:`, err);
          reject(err);
          return;
        }
        logger.debug("tflint init completed successfully");
        resolve();
      });
    });
  }

  private createFileWatcher() {
    if (!this.config?.configFilePath) {
      return;
    }

    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }

    logger.debug(`Creating file watcher for ${this.config.configFilePath}`);
    const watcher = vscode.workspace.createFileSystemWatcher(this.config.configFilePath);
    this.fileWatcher = watcher;

    watcher.onDidChange(async () => {
      logger.debug("TFLint config file changed, re-initializing...");
      await this.init(this.config!);
    });

    watcher.onDidDelete(() => {
      logger.debug("TFLint config file deleted");
      this.config!.configFilePath = undefined;
    });

    // in the event that the config file is created again
    watcher.onDidCreate(async (uri) => {
      logger.debug("TFLint config file created, re-initializing...");
      this.config!.configFilePath = uri.fsPath;
      await this.init(this.config!);
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
