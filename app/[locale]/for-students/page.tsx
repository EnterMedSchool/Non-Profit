import { redirect } from "next/navigation";

export default function ForStudentsPage({ params }: { params: Promise<{ locale: string }> }) {
  // This page has been removed. Redirect to homepage.
  redirect("/");
}
