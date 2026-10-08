import { notFound } from "next/navigation";

import HomeClient from "./HomeClient";
import { isValidLocale } from "../../i18n/config";


export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return <HomeClient locale={locale} />;
}