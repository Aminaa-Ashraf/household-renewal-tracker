import { signOutAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="secondary">
        Sign out of this device
      </Button>
    </form>
  );
}
