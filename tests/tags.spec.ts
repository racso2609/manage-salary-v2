import { beforeAll, expect, test, afterEach } from "vitest";
import { DbTestDescribe } from "./utils/describes";
import { Tag } from "@/types/Tags";
import { fetcher } from "./utils/fetchers";
import { createUser, login } from "./utils/users";
import { ALICE, BOB } from "./constants/users";
import { User } from "@/types/Db/user";
import { TagHandler } from "@/handlers/Db/tag";

const createTag = async (tag: Tag, token: string) => {
  return fetcher.post("/api/tags").send(tag).set("Authorization", token);
};

const deleteTag = async (tagId: string, token: string) => {
  return fetcher.delete(`/api/tags/${tagId}`).set("Authorization", token);
};

const getTag = async (tagId: string, token: string) => {
  return fetcher.get(`/api/tags/${tagId}`).set("Authorization", token);
};

const getTags = async (token: string) => {
  return fetcher.get(`/api/tags`).set("Authorization", token);
};

DbTestDescribe("Tags", () => {
  let token: string;
  let token2: string;
  let user: User & { _id: unknown };
  // let user2: User & { _id: unknown };
  let tag: Tag;

  beforeAll(async () => {
    const userCreate = await createUser(ALICE);

    await createUser(BOB);
    const loginResponse = await login(ALICE);
    const loginResponse2 = await login(BOB);

    token = "Bearer " + loginResponse.body.token;
    user = userCreate.body.user;
    tag = { name: "test", user: user._id };

    // user2 = userCreate2.body.user;
    token2 = "Bearer " + loginResponse2.body.token;
  });

  afterEach(async () => {
    await TagHandler.deleteMany({});
  });

  test("create tag: Tag already exist", async () => {
    await createTag(tag, token);
    const response = await createTag(tag, token);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Tag already exist");
  });

  test("create tag", async () => {
    const response = await createTag(tag, token);
    expect(response.statusCode).toBe(200);
    expect(response.body.tag.name).toBe(tag.name);
    expect(response.body.tag.user).toBe(tag.user);
  });
  test("remove tag: Tag doesn't exist", async () => {
    const response = await deleteTag(user?._id?.toString() ?? "", token);
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Tag doesn't exist");
  });
  test("remove tag: Tag not owned", async () => {
    const createdResponse = await createTag(tag, token);
    const tagId = createdResponse.body.tag._id;

    const response = await deleteTag(tagId, token2);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Tag not owned");
  });
  test("remove tag", async () => {
    const createdResponse = await createTag(tag, token);
    const tagId = createdResponse.body.tag._id;

    const response = await deleteTag(tagId, token);
    expect(response.statusCode).toBe(200);
    expect(response.body.deleted);

    const tags = await TagHandler.find({ user: user._id });

    expect(tags.length).toBe(0);
  });

  test("getTags", async () => {
    await createTag(tag, token);
    await createTag({ ...tag, name: "test2" }, token);
    await createTag(tag, token2);
    const response = await getTags(token);

    expect(response.body.tags.length).toBe(2);
  });

  test("getTag: revert not your tag");
  test("getTag");
});
