import { SITE_URL } from "@/lib/site";

export default function sitemap() {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/plan`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
