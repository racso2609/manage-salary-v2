import app from "@/server";
import supertest from "supertest";

export const fetcher = supertest(app);
