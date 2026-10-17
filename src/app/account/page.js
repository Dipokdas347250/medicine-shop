import { Suspense } from "react";
import { PageSkeleton } from "@/components/ui";
import AccountView from "./AccountView";

export const metadata = { title: "My Account" };

export default function AccountPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AccountView />
    </Suspense>
  );
}
