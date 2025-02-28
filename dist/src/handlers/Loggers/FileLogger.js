"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLogger = void 0;
const env_1 = __importDefault(require("../../env"));
const utils_1 = require("../../utils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FileLogger {
    constructor(fileName = `log-${env_1.default.NODE_ENV}.log`) {
        this.fileName = fileName;
        this.filePath = path_1.default.join(__dirname, "..", "..", "..", fileName);
    }
    _parseMessage(messages) {
        return JSON.stringify((0, utils_1.cleanData)(messages));
    }
    _print(message, { filePath = this.filePath } = {}) {
        // print on console
        // eslint-disable-next-line
        console.log(message);
        // print on log file
        fs_1.default.appendFileSync(filePath, `[${new Date(Date.now())}]: ${message}\n`);
    }
    log(...messages) {
        const stringifyMessage = this._parseMessage(messages);
        const message = `(LOG): ${stringifyMessage}`;
        this._print(message);
    }
    error(...messages) {
        const stringifyMessage = this._parseMessage(messages);
        const errorMessage = `(ERROR): ${stringifyMessage}`;
        this._print(errorMessage);
    }
}
exports.FileLogger = FileLogger;
