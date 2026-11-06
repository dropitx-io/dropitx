// Run from dropitx-fe/: node --test lib/feature-flags.test.mjs
// The pricing switch (FR4.4): hidden unless NEXT_PUBLIC_SHOW_PRICING is exactly "true".
import { test } from "node:test";
import assert from "node:assert/strict";
import { showPricing } from "./feature-flags.ts";

test("pricing is hidden when the variable is unset", () => {
  assert.equal(showPricing({}), false);
});

test('pricing shows when the variable is "true"', () => {
  assert.equal(showPricing({ NEXT_PUBLIC_SHOW_PRICING: "true" }), true);
});

test('"TRUE", "1", "false" and an empty string keep pricing hidden', () => {
  for (const value of ["TRUE", "1", "false", "", " true"]) {
    assert.equal(showPricing({ NEXT_PUBLIC_SHOW_PRICING: value }), false, JSON.stringify(value));
  }
});

test("other variables do not turn it on", () => {
  assert.equal(showPricing({ SHOW_PRICING: "true" }), false);
});
