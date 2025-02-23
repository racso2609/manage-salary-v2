import { test } from "vitest";
import { DbTestDescribe } from "./utils/describes";

DbTestDescribe("inOutRecords", () => {
  test("create records: Invalid amount");
  test("create records: Invalid tag");
});
