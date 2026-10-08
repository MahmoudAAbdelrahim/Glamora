import { Suspense } from "react";
import UsersClient from "./UsersClient";


export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersClient />
    </Suspense>
  );
}