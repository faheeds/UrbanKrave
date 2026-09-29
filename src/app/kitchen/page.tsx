import type { Metadata } from "next";
import Kitchen from "@/components/Kitchen";

export const metadata: Metadata = { title: "Kitchen dashboard", robots: { index: false, follow: false } };
export default function Page() { return <Kitchen />; }
