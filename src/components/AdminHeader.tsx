import Link from "next/link";
import Brand from "./Brand";

export default function AdminHeader({ active }: { active: "orders" | "delivery" }) {
  return <header className="admin-top">
    <Brand />
    <nav className="admin-nav" aria-label="Kitchen dashboard">
      <Link href="/kitchen" aria-current={active === "orders" ? "page" : undefined}>Orders</Link>
      <Link href="/kitchen/delivery" aria-current={active === "delivery" ? "page" : undefined}>Delivery partners</Link>
    </nav>
  </header>;
}
