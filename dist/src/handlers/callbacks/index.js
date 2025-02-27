"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
const asyncHandler = (asyncFn) => (req, res, next) => {
    return asyncFn(req, res, next).catch((e) => {
        return next(e);
    });
};
exports.asyncHandler = asyncHandler;
