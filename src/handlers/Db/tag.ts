import { DbRepository } from ".";
import TagModel from "@/models/tag";

export const TagHandler = new DbRepository(TagModel);
