import Link from "next/link";
import { StatusPage } from "@/app/(content)/_ui/status-page";
import { squareButton } from "@/app/(content)/_ui/public-styles";

export default function NotFound() {
  return (
    <StatusPage
      title="Nothing at this link."
      message="The link is mistyped, or the page was deleted or has expired."
      action={
        <Link href="/" className={squareButton()}>
          Back to DropItX
        </Link>
      }
    />
  );
}
