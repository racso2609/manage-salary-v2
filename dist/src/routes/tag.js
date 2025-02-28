"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tag_1 = require("../controllers/tag");
const authentication_1 = require("../middlewares/authentication");
const express_1 = require("express");
const tagRouter = (0, express_1.Router)();
tagRouter.route("/").get(authentication_1.protect, tag_1.getTags).post(authentication_1.protect, tag_1.createTag);
tagRouter.route("/:tagId").delete(authentication_1.protect, tag_1.deleteTag).get(authentication_1.protect, tag_1.getTag);
exports.default = tagRouter;
