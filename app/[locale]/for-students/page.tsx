import { permanentRedirect } from "next/navigation";

export default function ForStudentsPage({ params }: { params: Promise<{ locale: string }> }) {
  // This page has been removed. 308 permanent redirect to homepage
  // so search engines transfer ranking signals to the target URL.
  permanentRedirect("/");
}
