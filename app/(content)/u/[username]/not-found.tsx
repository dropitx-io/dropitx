import Link from "next/link";
import { StatusPage } from "@/app/(content)/_ui/status-page";
import { squareButton } from "@/app/(content)/_ui/public-styles";

export default function ProfileNotFound() {
  return (
    <StatusPage
      title="No profile here."
      message="No user has that username, or their profile is not public."
      action={
        <Link href="/" className={squareButton()}>
          Back to DropItX
        </Link>
      }
    />
  );
}
