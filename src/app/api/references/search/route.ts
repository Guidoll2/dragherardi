// app/api/references/search/route.ts
// Searches CrossRef API for academic references by DOI or title
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

interface CrossRefItem {
  DOI?: string;
  title?: string[];
  author?: { given?: string; family?: string }[];
  "container-title"?: string[];
  published?: { "date-parts"?: number[][] };
  "published-print"?: { "date-parts"?: number[][] };
  volume?: string;
  page?: string;
  URL?: string;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.approved) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const doi = searchParams.get("doi");

    if (!query && !doi) {
      return NextResponse.json({ error: "Query or DOI required" }, { status: 400 });
    }

    let results: CrossRefItem[] = [];

    if (doi) {
      // Search by DOI directly
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, "");
      try {
        const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`, {
          headers: { "User-Agent": "NeuroscienceResearchPlatform/1.0" },
        });
        if (response.ok) {
          const data = await response.json();
          results = [data.message];
        }
      } catch {
        // DOI not found, continue
      }
    } else if (query) {
      // Search by query string
      const response = await fetch(
        `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=10&select=DOI,title,author,container-title,published,published-print,volume,page,URL`,
        { headers: { "User-Agent": "NeuroscienceResearchPlatform/1.0" } }
      );
      if (response.ok) {
        const data = await response.json();
        results = data.message?.items || [];
      }
    }

    // Format results
    const formatted = results.map((item: CrossRefItem) => {
      const authors = item.author
        ? item.author
            .map((a) => `${a.family || ""}${a.given ? `, ${a.given.charAt(0)}.` : ""}`)
            .join(", ")
        : "Unknown";

      const dateInfo = item.published || item["published-print"];
      const year = dateInfo?.["date-parts"]?.[0]?.[0]?.toString() || "n.d.";

      return {
        doi: item.DOI || "",
        title: item.title?.[0] || "Untitled",
        authors,
        journal: item["container-title"]?.[0] || "",
        year,
        volume: item.volume || "",
        pages: item.page || "",
        url: item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : ""),
      };
    });

    return NextResponse.json({ results: formatted });
  } catch (error) {
    console.error("Error searching references:", error);
    return NextResponse.json({ error: "Error buscando referencias" }, { status: 500 });
  }
}
