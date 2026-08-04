import type { Metadata } from "next"

// Internal search results are thin, parameterized pages with no standalone SEO
// value. We let crawlers reach the page (removed from robots disallow) but tell
// them not to index it, which is the correct way to keep it out of the index.
export const metadata: Metadata = {
  title: "Search | Mass Pension",
  robots: {
    index: false,
    follow: true,
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
