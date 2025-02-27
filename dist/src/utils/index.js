"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanData = void 0;
const cleanData = (messages) => {
    const isArray = Array.isArray(messages);
    if (isArray)
        return messages.map((message) => (0, exports.cleanData)(message));
    const isObject = typeof messages === "object";
    if (isObject)
        // @ts-expect-error this type of data should have keys
        return Object.keys(messages).reduce((acc, key) => {
            // @ts-expect-error this type of data should have keys
            const value = messages[key];
            const sanitizedValue = (0, exports.cleanData)(value);
            acc[key] = sanitizedValue;
            return acc;
        }, {});
    const toStringTypes = ["string", "number", "bigint", "boolean"];
    // @ts-expect-error this type of data should have toString
    if (toStringTypes.includes(typeof messages))
        return messages.toString();
    return messages;
};
exports.cleanData = cleanData;
