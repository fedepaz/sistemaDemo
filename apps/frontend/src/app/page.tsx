// Should check cookie before defaulting to 'en'

import { redirect } from "next/navigation";

export default async function RootPage() {
  // Redirect to the dashboard or login page, as the root page itself should not cause an infinite loop.
  // For now, redirect to a placeholder, or the new dashboard structure.
  // Assuming the new dashboard is under /dashboard for now.
  redirect("/dashboard");
}
