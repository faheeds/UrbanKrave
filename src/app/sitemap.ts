import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) return [];
  const paths = ["/", "/menu", "/build", "/catering", "/about"];
  return paths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "/" || path === "/menu" ? "weekly" : "monthly",
  }));
}
