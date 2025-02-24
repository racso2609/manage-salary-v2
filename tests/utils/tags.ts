import { Tag } from "@/types/Tags";
import { fetcher } from "./fetchers";

export const createTag = async (tag: Tag, token: string) => {
  return fetcher.post("/api/tags").send(tag).set("Authorization", token);
};

export const deleteTag = async (tagId: string, token: string) => {
  return fetcher.delete(`/api/tags/${tagId}`).set("Authorization", token);
};

export const getTag = async (tagId: string, token: string) => {
  return fetcher.get(`/api/tags/${tagId}`).set("Authorization", token);
};

export const getTags = async (token: string) => {
  return fetcher.get(`/api/tags`).set("Authorization", token);
};
