import { beforeAll, expect, test, afterEach } from "vitest";
import { DbTestDescribe } from "./utils/describes";
import { fetcher } from "./utils/fetchers";
import { InOutRecord } from "@/types/InOut";
import { User } from "@/types/Db/user";
import { createUser, login } from "./utils/users";
import { ALICE, BOB } from "./constants/users";
import { createTag } from "./utils/tags";
import InOutRecordHandler from "@/handlers/Db/inOutRecord";
import { cleanData } from "@/utils";

const createRecord = async (
  record: Omit<InOutRecord, "user">,
  token: string,
) => {
  return fetcher
    .post("/api/records")
    .send(cleanData(record))
    .set("Authorization", token);
};

const removeRecord = async (recordId: string, token: string) => {
  return fetcher.delete(`/api/records/${recordId}`).set("Authorization", token);
};

const getRecords = async (
  token: string,
  queryParams: Record<string, string | number> = {},
) => {
  const query = Object.keys(queryParams)
    .map((param) => `${param}=${queryParams[param] ?? "a"}`)
    .join("&");
  return fetcher.get(`/api/records?${query}`).set("Authorization", token);
};

const getDashboardInfo = async (token: string) => {
  return fetcher.get(`/api/records/dashboard`).set("Authorization", token);
};

DbTestDescribe("inOutRecords", () => {
  let user: User & { _id: unknown };
  let token: string;
  let token2: string;
  let record: Omit<InOutRecord, "user">;
  let tagId: string;
  let tagId2: string;

  beforeAll(async () => {
    const userResponse = await createUser(ALICE);
    const loginResponse = await login(ALICE);

    token = "Bearer " + loginResponse.body.token;
    user = userResponse.body.user;

    await createUser(BOB);
    const loginResponse2 = await login(BOB);

    token2 = "Bearer " + loginResponse2.body.token;

    const tag = { name: "hola" };

    const createTagResponse = await createTag(tag, token);
    const createTagResponse2 = await createTag(tag, token2);

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

  afterEach(async () => {
    await InOutRecordHandler.deleteMany({});
  });

  test("create records: Invalid amount", async () => {
    const response = await createRecord({ ...record, amount: 0n }, token);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid amount");
  });
  test("create records: Invalid tag", async () => {
    const response = await createRecord({ ...record, tag: tagId2 }, token);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid tag");
  });
  test("create record (out)", async () => {
    const response = await createRecord(
      { ...record, type: "out", currency: "USD" },
      token,
    );
    console.log("=== response.body", response.body, response.text);
    expect(response.statusCode).toBe(200);

    expect(response.body.record.user.toString()).toBe(user?._id?.toString());
    expect(response.body.record.description).toBe(record.description);
    expect(response.body.record.currency).toBe(record.currency.toUpperCase());
    expect(response.body.record.type).toBe("out");
    expect(response.body.record.amount).toBe(record.amount.toString());
    expect(response.body.record.tag).toBe(record.tag);
  });
  test("create record (in)", async () => {
    const response = await createRecord({ ...record }, token);
    expect(response.statusCode).toBe(200);

    expect(response.body.record.user).toBe(user?._id?.toString());
    expect(response.body.record.description).toBe(record.description);
    expect(response.body.record.currency).toBe(record.currency.toUpperCase());
    expect(response.body.record.type).toBe(record.type);
    expect(response.body.record.amount).toBe(record.amount.toString());
    expect(response.body.record.tag).toBe(record.tag);
  });

  test("remove record: Record doesnt exist", async () => {
    const response = await removeRecord(user?._id?.toString() ?? "", token);
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Record doesnt exist");
  });
  test("remove record: Record not owned", async () => {
    const recordResponse = await createRecord(record, token);
    const response = await removeRecord(
      recordResponse.body.record._id ?? "",
      token2,
    );
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Record not owned");
  });
  test("remove record", async () => {
    const recordResponse = await createRecord(record, token);
    const response = await removeRecord(
      recordResponse.body.record._id ?? "",
      token,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.deleted);
  });

  test("get records", async () => {
    await createRecord(record, token);
    await createRecord({ ...record, type: "out" }, token);
    await createRecord(record, token2);

    const response = await getRecords(token);
    expect(response.statusCode).toBe(200);
    expect(response.body.records.length).toBe(2);
    expect(response.body.records.map((a) => a.type).join("/")).toBe("in/out");
  });
  test("get records: paginated", async () => {
    await createRecord(record, token);
    await createRecord({ ...record, type: "out" }, token);
    await createRecord(record, token2);

    const response = await getRecords(token, { page: 0, limit: 1 });
    expect(response.statusCode).toBe(200);
    expect(response.body.records.length).toBe(1);
    expect(response.body.records.at(0).type).toBe("in");

    const response2 = await getRecords(token, { page: 1, limit: 1 });
    expect(response2.statusCode).toBe(200);
    expect(response2.body.records.at(0).type).toBe("out");
  });
  test("get records: by type", async () => {
    await createRecord(record, token);
    await createRecord({ ...record, type: "out" }, token);
    await createRecord(record, token2);

    const response = await getRecords(token, { recordType: "in" });
    expect(response.statusCode).toBe(200);
    expect(response.body.records.length).toBe(1);
    expect(response.body.records.at(0).type).toBe("in");

    const response2 = await getRecords(token, { recordType: "out" });
    expect(response2.statusCode).toBe(200);
    expect(response2.body.records.at(0).type).toBe("out");
  });

  test("get dashboard records", async () => {
    await createRecord({ ...record, amount: 10n }, token);
    await createRecord({ ...record, type: "out" }, token);
    await createRecord(record, token2);

    const response = await getDashboardInfo(token);
    expect(response.statusCode).toBe(200);

    expect(response.body.records.length).toBe(2);
    expect(response.body.records.map((a) => a._id).join("/")).toBe("out/in");
    expect(response.body.total).toBe(9);
  });
});
