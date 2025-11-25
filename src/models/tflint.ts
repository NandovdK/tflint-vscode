export interface TFLintResult {
  issues: TFLintIssue[];
  errors: TFLintError[];
}

export interface TFLintIssue {
  rule: TFLintRule;
  message: string;
  range: TFLintRange;
  callers: string[];
  fixable: boolean;
  fixed: boolean;
}

export interface TFLintRule {
  name: string;
  severity: "info" | "warning" | "error" | string;
  link: string;
}

export interface TFLintRange {
  filename: string;
  start: TFLintPosition;
  end: TFLintPosition;
}

export interface TFLintPosition {
  line: number;
  column: number;
}

export interface TFLintError {
  message: string;
  [key: string]: any;
}
