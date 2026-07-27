import { describe, expect, test } from "vitest";
import {
  isAllowlistedAdminUserId,
  parseAdminUserIds,
} from "@/lib/adminUserAllowlist";

describe("adminUserAllowlist", () => {
  test("parses comma-separated ids", () => {
    expect([...parseAdminUserIds(" a,b , c ")].sort()).toEqual(["a", "b", "c"]);
    expect(parseAdminUserIds("").size).toBe(0);
  });

  test("allowlist check", () => {
    expect(isAllowlistedAdminUserId("u1", "u1,u2")).toBe(true);
    expect(isAllowlistedAdminUserId("u3", "u1,u2")).toBe(false);
    expect(isAllowlistedAdminUserId(null, "u1")).toBe(false);
  });
});
