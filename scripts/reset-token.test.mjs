import assert from "node:assert/strict";
import test from "node:test";
import { getResetToken } from "../app/reset-password/reset-token.ts";

test("recognizes current email links with a fragment", () => {
  assert.equal(getResetToken(new URL("https://sugarmimo.com/reset-password#token=test-token")), "test-token");
});

test("recognizes legacy email links with a query parameter", () => {
  assert.equal(getResetToken(new URL("https://sugarmimo.com/reset-password?token=test-token")), "test-token");
});

test("prefers the fragment when both formats are present", () => {
  assert.equal(getResetToken(new URL("https://sugarmimo.com/reset-password?token=old#token=current")), "current");
});

test("falls back to the query when the fragment token is empty", () => {
  assert.equal(getResetToken(new URL("https://sugarmimo.com/reset-password?token=test-token#token=")), "test-token");
});

test("identifies incomplete links", () => {
  for (const suffix of ["", "?token=", "#token=", "?token=%20#token=%20"]) {
    assert.equal(getResetToken(new URL(`https://sugarmimo.com/reset-password${suffix}`)), "");
  }
});
