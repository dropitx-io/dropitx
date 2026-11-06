/** Install and run strings for the dropitx CLI, shared by the landing page and the developers page. */
export const CLI_INSTALL_COMMAND = "npm install -g dropitx";
export const CLI_NPX_COMMAND = "npx dropitx";
/** Runs the package as an MCP server over stdio. */
export const CLI_MCP_COMMAND = "npx -y dropitx mcp";

export const CLI_PACKAGE_URL = "https://www.npmjs.com/package/dropitx";

/** The MCP client configuration (Claude Desktop, Cursor and other clients), as pretty-printed JSON. */
export const MCP_CLIENT_CONFIG = JSON.stringify(
  { mcpServers: { dropitx: { command: "npx", args: ["-y", "dropitx", "mcp"] } } },
  null,
  2,
);
