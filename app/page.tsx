import { redirect } from "next/navigation";

export default function Home() {
  // No app screens yet — the design-system foundation lives at /style-guide.
  redirect("/style-guide");
}
