// Run from dropitx-fe/: node --test "app/(public)/auth/_ui/validate-auth.test.mjs"
// Inline checks on the auth forms (FR6.1, NFR5): nothing is sent until they pass.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MIN_PASSWORD_LENGTH, hasErrors, validateCredentials, validateEmail, validatePassword } from "./validate-auth.ts";

test("a complete email passes", () => {
  assert.equal(validateEmail("me@example.com"), null);
  assert.equal(validateEmail("  me@example.co.uk  "), null);
});

test("an incomplete email gets the inline message", () => {
  for (const value of ["me@", "me@example", "me@example.c", "me example@x.com", "@example.com"]) {
    assert.equal(validateEmail(value), "That email address looks incomplete.", value);
  }
});

test("an empty email asks for one", () => {
  assert.equal(validateEmail(""), "Enter your email address.");
  assert.equal(validateEmail("   "), "Enter your email address.");
});

test("an empty password asks for one, in both modes", () => {
  assert.equal(validatePassword(""), "Enter your password.");
  assert.equal(validatePassword("", MIN_PASSWORD_LENGTH), "Enter your password.");
});

test("sign-in accepts any non-empty password; sign-up needs the minimum length", () => {
  assert.equal(MIN_PASSWORD_LENGTH, 6);
  assert.equal(validatePassword("short"), null);
  assert.equal(validatePassword("short", MIN_PASSWORD_LENGTH), "Use at least 6 characters.");
  assert.equal(validatePassword("correct horse", MIN_PASSWORD_LENGTH), null);
});

test("validateCredentials applies the length rule only when signing up", () => {
  assert.deepEqual(validateCredentials("me@example.com", "short", "signin"), { email: null, password: null });
  const signup = validateCredentials("me@", "short", "signup");
  assert.deepEqual(signup, { email: "That email address looks incomplete.", password: "Use at least 6 characters." });
  assert.equal(hasErrors(signup), true);
  assert.equal(hasErrors({ email: null, password: null }), false);
});

test("the password input has no name, so a browser form submission could not put it in a URL", () => {
  const fields = readFileSync(new URL("./auth-fields.tsx", import.meta.url), "utf8");
  const passwordInput = fields.slice(fields.indexOf('id="password"') - 200, fields.indexOf('id="password"') + 300);
  assert.doesNotMatch(passwordInput, /\bname=/);
  const form = readFileSync(new URL("./credentials-form.tsx", import.meta.url), "utf8");
  assert.match(form, /e\.preventDefault\(\)/);
  assert.doesNotMatch(form, /\baction=/);
});
