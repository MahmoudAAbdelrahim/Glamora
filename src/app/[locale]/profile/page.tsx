import ProfileClient from "../../../components/Profile/ProfileClient";


interface ProfilePageProps {
  params: Promise<{
    locale: "ar" | "en";
  }>;
}

export default async function ProfilePage({
  params,
}: ProfilePageProps) {
  const { locale } = await params;

  return <ProfileClient locale={locale} />;
}