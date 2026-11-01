export const CLI_INSTALL_COMMAND = "npm install -g dropitx";
export const CLI_NPX_COMMAND = "npx dropitx";

export const MCP_CLIENT_CONFIG = JSON.stringify(
  { mcpServers: { dropitx: { command: "npx", args: ["-y", "dropitx", "mcp"] } } },
  null,
  2,
);
