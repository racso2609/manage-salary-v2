import {
  createTag,
  deleteTag,
  getTag,
  getTags,
  tagInfo,
} from "@/controllers/tag";
import { protect } from "@/middlewares/authentication";
import { Router } from "express";

const tagRouter = Router();

tagRouter.route("/").get(protect, getTags).post(protect, createTag);
tagRouter.route("/:tagId").delete(protect, deleteTag).get(protect, getTag);
tagRouter.route("/:tagId/info").get(protect, tagInfo);

export default tagRouter;
