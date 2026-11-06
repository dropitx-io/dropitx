// Run from dropitx-fe/: node --test lib/cli-install.test.mjs
// The install strings the Copy buttons write to the clipboard (FR5.2).
import { test } from "node:test";
import assert from "node:assert/strict";
import { CLI_INSTALL_COMMAND, CLI_MCP_COMMAND, CLI_NPX_COMMAND, MCP_CLIENT_CONFIG } from "./cli-install.ts";

test("the install command is the global npm install", () => {
  assert.equal(CLI_INSTALL_COMMAND, "npm install -g dropitx");
});

test("the MCP command runs the package with npx -y", () => {
  assert.equal(CLI_MCP_COMMAND, "npx -y dropitx mcp");
  assert.equal(CLI_NPX_COMMAND, "npx dropitx");
});

test("the MCP client snippet parses as JSON and runs the same command", () => {
  const config = JSON.parse(MCP_CLIENT_CONFIG);
  const server = config.mcpServers.dropitx;
  assert.equal(server.command, "npx");
  assert.deepEqual(server.args, ["-y", "dropitx", "mcp"]);
  assert.equal([server.command, ...server.args].join(" "), CLI_MCP_COMMAND);
});

test("the snippet is pretty-printed for pasting, not a one-line string", () => {
  assert.ok(MCP_CLIENT_CONFIG.includes("\n  "), "expected two-space indentation");
  assert.throws(() => JSON.parse(MCP_CLIENT_CONFIG.slice(0, -1)), SyntaxError);
});
