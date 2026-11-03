import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";

export const metadata: Metadata = {
  title: "DropItX: drop a file, get a link",
  description:
    "DropItX turns a Markdown or HTML file into a rendered page behind a short link, with passwords, expiry, burn after reading and view analytics.",
};

export default function Home() {
  return <HomePage />;
}
