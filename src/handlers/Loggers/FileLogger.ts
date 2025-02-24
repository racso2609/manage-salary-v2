import environment from "@/env";
import { cleanData } from "@/utils";
import fs from "fs";
import path from "path";

export class FileLogger {
  protected filePath: string;

  constructor(public fileName: string = `log-${environment.NODE_ENV}.log`) {
    this.filePath = path.join(__dirname, "..", "..", fileName);
  }

  protected _parseMessage(messages: unknown): string {
    return JSON.stringify(cleanData(messages))
  }

  protected _print(
    message: string,
    { filePath = this.filePath }: { filePath?: string } = {},
  ) {
    // print on console
    // eslint-disable-next-line
    console.log(message);

    // print on log file
    fs.appendFileSync(filePath, `[${new Date(Date.now())}]: ${message}\n`);
  }

  log(...messages: unknown[]) {
    const stringifyMessage = this._parseMessage(messages);
    const message = `(LOG): ${stringifyMessage}`;
    this._print(message);
  }

  error(...messages: unknown[]) {
    const stringifyMessage = this._parseMessage(messages);
    const errorMessage = `(ERROR): ${stringifyMessage}`;
    this._print(errorMessage);
  }
}
