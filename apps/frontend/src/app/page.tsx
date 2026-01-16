// Should check cookie before defaulting to 'en'

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
type LocaleKey = "en" | "es" | "it";

export default async function RootPage() {
  // Check cookie here before redirecting
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale =
    cookieLocale &&
    (cookieLocale === "en" || cookieLocale === "es" || cookieLocale === "it")
      ? (cookieLocale as LocaleKey)
      : "en";

  // Redirect to /{locale} instead of hardcoded /en
  redirect(`/${locale}`);
}
