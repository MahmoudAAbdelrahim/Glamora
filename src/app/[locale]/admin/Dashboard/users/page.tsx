import { Suspense } from "react";
import UsersClient from "./UsersClient";

export const instant = false;

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersClient />
    </Suspense>
  );
}