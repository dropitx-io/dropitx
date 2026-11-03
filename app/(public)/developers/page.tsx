import type { Metadata } from "next";
import { DevelopersPage } from "@/components/developers-page";

export const metadata: Metadata = {
  title: "DropItX for developers",
  description: "Install the dropitx CLI, upload a file or pipe text and get a share link back. Agents use the same package as an MCP server.",
};

export default function Developers() {
  return <DevelopersPage />;
}
