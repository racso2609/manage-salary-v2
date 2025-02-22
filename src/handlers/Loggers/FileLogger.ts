import environment from "@/env";
import fs from "fs";
import path from "path";

export class FileLogger {
  protected filePath: string;

  constructor(public fileName: string = `log-${environment.NODE_ENV}.log`) {
    this.filePath = path.join(__dirname, "..", "..", fileName);
  }

  protected _parseMessage(messages: unknown): string {
    if (!messages) return "";
    const isArray = Array.isArray(messages);
    if (isArray)
      return JSON.stringify(
        messages.map((message) => this._parseMessage(message)),
      );

    const isObject = typeof messages === "object";

    if (isObject)
      return JSON.stringify(
        Object.keys(messages).reduce(
          (acc, key) => {
            // @ts-expect-error this type of data should have keys
            const value = messages[key];
            const sanitizedValue = this._parseMessage(value);

            acc[key] = sanitizedValue;
            return acc;
          },
          {} as Record<string, unknown>,
        ),
      );
    const toStringTypes = ["string", "number", "bigint", "boolean"];

    if (toStringTypes.includes(typeof messages)) return messages.toString();

    return JSON.stringify(messages);
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
