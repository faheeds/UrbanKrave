import Image from "next/image";
import Link from "next/link";

export default function Brand() {
  return <Link href="/" className="brand" aria-label="Urban Krave home">
    <Image className="brand-mark" src="/urban-krave-logo-512.png" alt="" width={64} height={64} sizes="(max-width: 900px) 48px, 64px" />
    <span className="brand-wordmark">Urban <em>Krave</em></span>
  </Link>;
}
