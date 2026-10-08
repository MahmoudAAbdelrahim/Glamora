import { Suspense } from "react";
import AdminDashboardClient from "./AdminDashboardClient";

export const instant = false;

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardClient />
    </Suspense>
  );
}
