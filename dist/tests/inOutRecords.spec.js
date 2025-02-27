"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const describes_1 = require("./utils/describes");
const fetchers_1 = require("./utils/fetchers");
const users_1 = require("./utils/users");
const users_2 = require("./constants/users");
const tags_1 = require("./utils/tags");
const inOutRecord_1 = __importDefault(require("@/handlers/Db/inOutRecord"));
const utils_1 = require("@/utils");
const createRecord = async (record, token) => {
    return fetchers_1.fetcher
        .post("/api/records")
        .send((0, utils_1.cleanData)(record))
        .set("Authorization", token);
};
const removeRecord = async (recordId, token) => {
    return fetchers_1.fetcher.delete(`/api/records/${recordId}`).set("Authorization", token);
};
const getRecords = async (token, queryParams = {}) => {
    const query = Object.keys(queryParams)
        .map((param) => `${param}=${queryParams[param] ?? "a"}`)
        .join("&");
    return fetchers_1.fetcher.get(`/api/records?${query}`).set("Authorization", token);
};
const getDashboardInfo = async (token) => {
    return fetchers_1.fetcher.get(`/api/records/dashboard`).set("Authorization", token);
};
(0, describes_1.DbTestDescribe)("inOutRecords", () => {
    let user;
    let token;
    let token2;
    let record;
    let tagId;
    let tagId2;
    (0, vitest_1.beforeAll)(async () => {
        const userResponse = await (0, users_1.createUser)(users_2.ALICE);
        const loginResponse = await (0, users_1.login)(users_2.ALICE);
        token = "Bearer " + loginResponse.body.token;
        user = userResponse.body.user;
        await (0, users_1.createUser)(users_2.BOB);
        const loginResponse2 = await (0, users_1.login)(users_2.BOB);
        token2 = "Bearer " + loginResponse2.body.token;
        const tag = { name: "hola" };
        const createTagResponse = await (0, tags_1.createTag)(tag, token);
        const createTagResponse2 = await (0, tags_1.createTag)(tag, token2);
        tagId = createTagResponse.body.tag._id;
        tagId2 = createTagResponse2.body.tag._id;
        record = {
            description: "putas",
            tag: tagId,
            amount: 1n,
            type: "in",
            currency: "usd",
        };
    });
    (0, vitest_1.afterEach)(async () => {
        await inOutRecord_1.default.deleteMany({});
    });
    (0, vitest_1.test)("create records: Invalid amount", async () => {
        const response = await createRecord({ ...record, amount: 0n }, token);
        (0, vitest_1.expect)(response.statusCode).toBe(400);
        (0, vitest_1.expect)(response.body.message).toBe("Invalid amount");
    });
    (0, vitest_1.test)("create records: Invalid tag", async () => {
        const response = await createRecord({ ...record, tag: tagId2 }, token);
        (0, vitest_1.expect)(response.statusCode).toBe(400);
        (0, vitest_1.expect)(response.body.message).toBe("Invalid tag");
    });
    (0, vitest_1.test)("create record (out)", async () => {
        const response = await createRecord({ ...record, type: "out", currency: "USD" }, token);
        console.log("=== response.body", response.body, response.text);
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        (0, vitest_1.expect)(response.body.record.user.toString()).toBe(user?._id?.toString());
        (0, vitest_1.expect)(response.body.record.description).toBe(record.description);
        (0, vitest_1.expect)(response.body.record.currency).toBe(record.currency.toUpperCase());
        (0, vitest_1.expect)(response.body.record.type).toBe("out");
        (0, vitest_1.expect)(response.body.record.amount).toBe(record.amount.toString());
        (0, vitest_1.expect)(response.body.record.tag).toBe(record.tag);
    });
    (0, vitest_1.test)("create record (in)", async () => {
        const response = await createRecord({ ...record }, token);
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        (0, vitest_1.expect)(response.body.record.user).toBe(user?._id?.toString());
        (0, vitest_1.expect)(response.body.record.description).toBe(record.description);
        (0, vitest_1.expect)(response.body.record.currency).toBe(record.currency.toUpperCase());
        (0, vitest_1.expect)(response.body.record.type).toBe(record.type);
        (0, vitest_1.expect)(response.body.record.amount).toBe(record.amount.toString());
        (0, vitest_1.expect)(response.body.record.tag).toBe(record.tag);
    });
    (0, vitest_1.test)("remove record: Record doesnt exist", async () => {
        const response = await removeRecord(user?._id?.toString() ?? "", token);
        (0, vitest_1.expect)(response.statusCode).toBe(404);
        (0, vitest_1.expect)(response.body.message).toBe("Record doesnt exist");
    });
    (0, vitest_1.test)("remove record: Record not owned", async () => {
        const recordResponse = await createRecord(record, token);
        const response = await removeRecord(recordResponse.body.record._id ?? "", token2);
        (0, vitest_1.expect)(response.statusCode).toBe(401);
        (0, vitest_1.expect)(response.body.message).toBe("Record not owned");
    });
    (0, vitest_1.test)("remove record", async () => {
        const recordResponse = await createRecord(record, token);
        const response = await removeRecord(recordResponse.body.record._id ?? "", token);
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        (0, vitest_1.expect)(response.body.deleted);
    });
    (0, vitest_1.test)("get records", async () => {
        await createRecord(record, token);
        await createRecord({ ...record, type: "out" }, token);
        await createRecord(record, token2);
        const response = await getRecords(token);
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        (0, vitest_1.expect)(response.body.records.length).toBe(2);
        (0, vitest_1.expect)(response.body.records.map((a) => a.type).join("/")).toBe("in/out");
    });
    (0, vitest_1.test)("get records: paginated", async () => {
        await createRecord(record, token);
        await createRecord({ ...record, type: "out" }, token);
        await createRecord(record, token2);
        const response = await getRecords(token, { page: 0, limit: 1 });
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        (0, vitest_1.expect)(response.body.records.length).toBe(1);
        (0, vitest_1.expect)(response.body.records.at(0).type).toBe("in");
        const response2 = await getRecords(token, { page: 1, limit: 1 });
        (0, vitest_1.expect)(response2.statusCode).toBe(200);
        (0, vitest_1.expect)(response2.body.records.at(0).type).toBe("out");
    });
    (0, vitest_1.test)("get records: by type", async () => {
        await createRecord(record, token);
        await createRecord({ ...record, type: "out" }, token);
        await createRecord(record, token2);
        const response = await getRecords(token, { recordType: "in" });
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        (0, vitest_1.expect)(response.body.records.length).toBe(1);
        (0, vitest_1.expect)(response.body.records.at(0).type).toBe("in");
        const response2 = await getRecords(token, { recordType: "out" });
        (0, vitest_1.expect)(response2.statusCode).toBe(200);
        (0, vitest_1.expect)(response2.body.records.at(0).type).toBe("out");
    });
    (0, vitest_1.test)("get dashboard records", async () => {
        await createRecord({ ...record, amount: 10n }, token);
        await createRecord({ ...record, type: "out" }, token);
        await createRecord(record, token2);
        const response = await getDashboardInfo(token);
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        (0, vitest_1.expect)(response.body.records.length).toBe(2);
        (0, vitest_1.expect)(response.body.records.map((a) => a._id).join("/")).toBe("out/in");
        (0, vitest_1.expect)(response.body.total).toBe(9);
    });
});
