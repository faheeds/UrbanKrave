import type { Metadata } from "next";
import DeliveryPartners from "@/components/DeliveryPartners";

export const metadata: Metadata = { title: "Delivery partners", robots: { index: false, follow: false } };
export default function Page() { return <DeliveryPartners />; }
