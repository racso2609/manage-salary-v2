"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const describes_1 = require("./utils/describes");
const users_1 = require("./utils/users");
const users_2 = require("./constants/users");
const tag_1 = require("@/handlers/Db/tag");
const tags_1 = require("./utils/tags");
(0, describes_1.DbTestDescribe)("Tags", () => {
    let token;
    let token2;
    let user;
    // let user2: User & { _id: unknown };
    let tag;
    (0, vitest_1.beforeAll)(async () => {
        const userCreate = await (0, users_1.createUser)(users_2.ALICE);
        await (0, users_1.createUser)(users_2.BOB);
        const loginResponse = await (0, users_1.login)(users_2.ALICE);
        const loginResponse2 = await (0, users_1.login)(users_2.BOB);
        token = "Bearer " + loginResponse.body.token;
        user = userCreate.body.user;
        tag = { name: "test", user: user._id };
        // user2 = userCreate2.body.user;
        token2 = "Bearer " + loginResponse2.body.token;
    });
    (0, vitest_1.afterEach)(async () => {
        await tag_1.TagHandler.deleteMany({});
    });
    (0, vitest_1.test)("create tag: Tag already exist", async () => {
        await (0, tags_1.createTag)(tag, token);
        const response = await (0, tags_1.createTag)(tag, token);
        (0, vitest_1.expect)(response.statusCode).toBe(400);
        (0, vitest_1.expect)(response.body.message).toBe("Tag already exist");
    });
    (0, vitest_1.test)("create tag", async () => {
        const response = await (0, tags_1.createTag)(tag, token);
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        (0, vitest_1.expect)(response.body.tag.name).toBe(tag.name);
        (0, vitest_1.expect)(response.body.tag.user).toBe(tag.user);
    });
    (0, vitest_1.test)("remove tag: Tag doesn't exist", async () => {
        const response = await (0, tags_1.deleteTag)(user?._id?.toString() ?? "", token);
        (0, vitest_1.expect)(response.statusCode).toBe(404);
        (0, vitest_1.expect)(response.body.message).toBe("Tag doesn't exist");
    });
    (0, vitest_1.test)("remove tag: Tag not owned", async () => {
        const createdResponse = await (0, tags_1.createTag)(tag, token);
        const tagId = createdResponse.body.tag._id;
        const response = await (0, tags_1.deleteTag)(tagId, token2);
        (0, vitest_1.expect)(response.statusCode).toBe(401);
        (0, vitest_1.expect)(response.body.message).toBe("Tag not owned");
    });
    (0, vitest_1.test)("remove tag", async () => {
        const createdResponse = await (0, tags_1.createTag)(tag, token);
        const tagId = createdResponse.body.tag._id;
        const response = await (0, tags_1.deleteTag)(tagId, token);
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        (0, vitest_1.expect)(response.body.deleted);
        const tags = await tag_1.TagHandler.find({ user: user._id });
        (0, vitest_1.expect)(tags.length).toBe(0);
    });
    (0, vitest_1.test)("getTags", async () => {
        await (0, tags_1.createTag)(tag, token);
        await (0, tags_1.createTag)({ ...tag, name: "test2" }, token);
        await (0, tags_1.createTag)(tag, token2);
        const response = await (0, tags_1.getTags)(token);
        (0, vitest_1.expect)(response.body.tags.length).toBe(2);
    });
    (0, vitest_1.test)("getTag: revert not your tag");
    (0, vitest_1.test)("getTag", async () => {
        const tagCreationResponse = await (0, tags_1.createTag)(tag, token);
        const tagResponse = await (0, tags_1.getTag)(tagCreationResponse.body.tag._id, token);
        (0, vitest_1.expect)(tagResponse.body.tag.name).toBe(tag.name);
        (0, vitest_1.expect)(tagResponse.body.tag.user).toBe(user._id);
    });
});
