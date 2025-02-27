"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTags = exports.getTag = exports.deleteTag = exports.createTag = void 0;
const fetchers_1 = require("./fetchers");
const createTag = async (tag, token) => {
    return fetchers_1.fetcher.post("/api/tags").send(tag).set("Authorization", token);
};
exports.createTag = createTag;
const deleteTag = async (tagId, token) => {
    return fetchers_1.fetcher.delete(`/api/tags/${tagId}`).set("Authorization", token);
};
exports.deleteTag = deleteTag;
const getTag = async (tagId, token) => {
    return fetchers_1.fetcher.get(`/api/tags/${tagId}`).set("Authorization", token);
};
exports.getTag = getTag;
const getTags = async (token) => {
    return fetchers_1.fetcher.get(`/api/tags`).set("Authorization", token);
};
exports.getTags = getTags;
