import { Suspense } from "react";
import ProductsClient from "./ProductsClient";

export const instant = false;

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsClient />
    </Suspense>
  );
}
