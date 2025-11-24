import * as vscode from 'vscode';
import { TFLintResult, TFLintIssue } from '../models/tflint';
import { logger } from '../helpers/logger';

export function publish(collection: vscode.DiagnosticCollection, result: TFLintResult) {


    logger.debug(`Found ${result.issues.length} issues`);
    var diagnosticsByFile: Record<string, vscode.Diagnostic[]> = {};
    result.issues.forEach((issue: TFLintIssue) => {

        // Convert from 1-based to 0-based indexing
        const startLine = Math.max(0, issue.range.start.line - 1);
        const startChar = Math.max(0, issue.range.start.column - 1);
        const endLine = Math.max(startLine, issue.range.end.line - 1);
        const endChar = Math.max(startChar, issue.range.end.column - 1);

        const range = new vscode.Range(startLine, startChar, endLine, endChar);

        var severity: vscode.DiagnosticSeverity;
        if (issue.rule.severity === "info") {
            severity = vscode.DiagnosticSeverity.Information;
        } else if (issue.rule.severity === "warning") {
            severity = vscode.DiagnosticSeverity.Warning;
        } else {
            severity = vscode.DiagnosticSeverity.Warning;
        }

        const diag = new vscode.Diagnostic(
            range,
            issue.message,
            severity
        );

        diag.code = issue.rule.name;
        diag.source = "tflint-vscode";
        issue.range.filename = "/" + issue.range.filename;

        if (!diagnosticsByFile[issue.range.filename]) {
            logger.trace(`Publishig diagnostics for: ${issue.range.filename}`);
            diagnosticsByFile[issue.range.filename] = [];
        }
        diagnosticsByFile[issue.range.filename].push(diag);
    });

    for (var key in diagnosticsByFile) {
        collection.set(vscode.Uri.file(key), diagnosticsByFile[key]);
    }
};
