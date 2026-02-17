// app/api/publications/[id]/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/mongoDB/db";
import Publication from "@/mongoDB/models/publication";

// POST - Export publication to different formats
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.approved) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();

    const publication = await Publication.findById(id).lean();
    if (!publication) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }

    const { format } = await req.json();

    // Build formatted content based on paper structure
    const buildFormattedContent = () => {
      const parts: string[] = [];

      // Title
      parts.push(`# ${publication.title}\n`);

      // Authors
      const authors = [publication.authorName];
      if (publication.coAuthors?.length) {
        authors.push(...publication.coAuthors.map((ca: { name: string }) => ca.name));
      }
      parts.push(`**${authors.join(", ")}**\n`);

      // Structured Abstract
      if (publication.structuredAbstract) {
        const sa = publication.structuredAbstract;
        parts.push("## Abstract\n");
        if (sa.objective) parts.push(`**Objective:** ${sa.objective}\n`);
        if (sa.methods) parts.push(`**Methods:** ${sa.methods}\n`);
        if (sa.results) parts.push(`**Results:** ${sa.results}\n`);
        if (sa.conclusions) parts.push(`**Conclusions:** ${sa.conclusions}\n`);
      }

      // Keywords
      const allKeywords = [
        ...(publication.tags || []),
        ...(publication.meshKeywords || []),
      ];
      if (allKeywords.length > 0) {
        parts.push(`**Keywords:** ${allKeywords.join(", ")}\n`);
      }

      // Sections
      if (publication.sections?.length) {
        const sortedSections = [...publication.sections].sort(
          (a: { order: number }, b: { order: number }) => a.order - b.order
        );
        for (const section of sortedSections) {
          if (section.type !== "abstract") {
            parts.push(`## ${section.title}\n`);
            // Strip HTML tags for plain format
            const plainContent = section.content
              .replace(/<[^>]*>/g, "")
              .replace(/&nbsp;/g, " ")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">");
            parts.push(`${plainContent}\n`);
          }
        }
      } else if (publication.content) {
        // Fallback to legacy content
        const plainContent = publication.content
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ");
        parts.push(plainContent);
      }

      // References
      if (publication.references?.length) {
        parts.push("## References\n");
        const sortedRefs = [...publication.references].sort(
          (a: { order: number }, b: { order: number }) => a.order - b.order
        );
        sortedRefs.forEach((ref: {
          order: number;
          authors: string;
          year: string;
          title: string;
          journal?: string;
          volume?: string;
          pages?: string;
          doi?: string;
        }) => {
          let refStr = `[${ref.order}] ${ref.authors} (${ref.year}). ${ref.title}.`;
          if (ref.journal) refStr += ` *${ref.journal}*`;
          if (ref.volume) refStr += `, ${ref.volume}`;
          if (ref.pages) refStr += `, ${ref.pages}`;
          if (ref.doi) refStr += `. doi: ${ref.doi}`;
          parts.push(refStr);
        });
      }

      return parts.join("\n");
    };

    const content = buildFormattedContent();

    if (format === "markdown") {
      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${publication.title.replace(/[^a-zA-Z0-9]/g, "_")}.md"`,
        },
      });
    }

    if (format === "html") {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${publication.title}</title>
  <style>
    body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; color: #333; }
    h1 { font-size: 24px; text-align: center; margin-bottom: 8px; }
    h2 { font-size: 18px; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    .authors { text-align: center; font-style: italic; margin-bottom: 20px; }
    .keywords { margin-bottom: 20px; font-size: 14px; }
    .abstract { background: #f9f9f9; padding: 16px; border-left: 3px solid #666; margin-bottom: 24px; }
    .reference { margin-bottom: 8px; padding-left: 2em; text-indent: -2em; font-size: 14px; }
    .figure { text-align: center; margin: 20px 0; }
    .figure img { max-width: 100%; }
    .figure-caption { font-size: 13px; font-style: italic; margin-top: 8px; }
    p { margin-bottom: 12px; text-align: justify; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>${publication.title}</h1>
  <p class="authors">${[publication.authorName, ...(publication.coAuthors?.map((ca: { name: string }) => ca.name) || [])].join(", ")}</p>
  
  ${publication.structuredAbstract ? `
  <div class="abstract">
    <h2>Abstract</h2>
    ${publication.structuredAbstract.objective ? `<p><strong>Objective:</strong> ${publication.structuredAbstract.objective}</p>` : ""}
    ${publication.structuredAbstract.methods ? `<p><strong>Methods:</strong> ${publication.structuredAbstract.methods}</p>` : ""}
    ${publication.structuredAbstract.results ? `<p><strong>Results:</strong> ${publication.structuredAbstract.results}</p>` : ""}
    ${publication.structuredAbstract.conclusions ? `<p><strong>Conclusions:</strong> ${publication.structuredAbstract.conclusions}</p>` : ""}
  </div>` : ""}
  
  ${[...(publication.tags || []), ...(publication.meshKeywords || [])].length > 0
    ? `<p class="keywords"><strong>Keywords:</strong> ${[...(publication.tags || []), ...(publication.meshKeywords || [])].join(", ")}</p>`
    : ""}
  
  ${publication.sections?.length
    ? publication.sections
        .filter((s: { type: string }) => s.type !== "abstract")
        .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
        .map((s: { title: string; content: string }) => `<h2>${s.title}</h2>\n${s.content}`)
        .join("\n")
    : publication.content || ""}
  
  ${publication.figures?.length
    ? publication.figures
        .map((f: { type: string; number: number; caption: string; imageUrl?: string; tableHtml?: string }) =>
          f.type === "figure"
            ? `<div class="figure">${f.imageUrl ? `<img src="${f.imageUrl}" alt="${f.caption}">` : ""}<p class="figure-caption">Figure ${f.number}. ${f.caption}</p></div>`
            : `<div class="figure">${f.tableHtml || ""}<p class="figure-caption">Table ${f.number}. ${f.caption}</p></div>`
        )
        .join("\n")
    : ""}
  
  ${publication.references?.length
    ? `<h2>References</h2>\n${publication.references
        .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
        .map((ref: { order: number; authors: string; year: string; title: string; journal?: string; volume?: string; pages?: string; doi?: string }) => {
          let refStr = `<p class="reference">[${ref.order}] ${ref.authors} (${ref.year}). ${ref.title}.`;
          if (ref.journal) refStr += ` <em>${ref.journal}</em>`;
          if (ref.volume) refStr += `, ${ref.volume}`;
          if (ref.pages) refStr += `, ${ref.pages}`;
          if (ref.doi) refStr += `. doi: ${ref.doi}`;
          refStr += "</p>";
          return refStr;
        })
        .join("\n")}`
    : ""}
</body>
</html>`;

      return new NextResponse(htmlContent, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${publication.title.replace(/[^a-zA-Z0-9]/g, "_")}.html"`,
        },
      });
    }

    if (format === "latex") {
      const escLatex = (s: string) =>
        s.replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "\\&")
          .replace(/%/g, "\\%")
          .replace(/#/g, "\\#")
          .replace(/\$/g, "\\$")
          .replace(/_/g, "\\_");

      const authors = [publication.authorName, ...(publication.coAuthors?.map((ca: { name: string }) => ca.name) || [])];

      let latex = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{times}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage[margin=2.5cm]{geometry}
\\usepackage{setspace}
\\doublespacing

\\title{${escLatex(publication.title)}}
\\author{${authors.map(a => escLatex(a)).join(" \\and ")}}
\\date{}

\\begin{document}
\\maketitle

`;

      // Abstract
      if (publication.structuredAbstract) {
        const sa = publication.structuredAbstract;
        latex += "\\begin{abstract}\n";
        if (sa.objective) latex += `\\textbf{Objective:} ${escLatex(sa.objective)} `;
        if (sa.methods) latex += `\\textbf{Methods:} ${escLatex(sa.methods)} `;
        if (sa.results) latex += `\\textbf{Results:} ${escLatex(sa.results)} `;
        if (sa.conclusions) latex += `\\textbf{Conclusions:} ${escLatex(sa.conclusions)}`;
        latex += "\n\\end{abstract}\n\n";
      }

      // Keywords
      const kw = [...(publication.tags || []), ...(publication.meshKeywords || [])];
      if (kw.length) {
        latex += `\\textbf{Keywords:} ${kw.map(k => escLatex(k)).join(", ")}\n\n`;
      }

      // Sections
      if (publication.sections?.length) {
        const sorted = [...publication.sections]
          .filter((s: { type: string }) => s.type !== "abstract")
          .sort((a: { order: number }, b: { order: number }) => a.order - b.order);
        for (const section of sorted) {
          latex += `\\section{${escLatex(section.title)}}\n`;
          latex += escLatex(section.content) + "\n\n";
        }
      }

      // References
      if (publication.references?.length) {
        latex += "\\begin{thebibliography}{99}\n";
        const sortedRefs = [...publication.references].sort(
          (a: { order: number }, b: { order: number }) => a.order - b.order
        );
        for (const ref of sortedRefs) {
          latex += `\\bibitem{ref${ref.order}} ${escLatex(ref.authors)} (${ref.year}). ${escLatex(ref.title)}.`;
          if (ref.journal) latex += ` \\textit{${escLatex(ref.journal)}}`;
          if (ref.volume) latex += `, ${ref.volume}`;
          if (ref.pages) latex += `, ${ref.pages}`;
          if (ref.doi) latex += `. doi: ${ref.doi}`;
          latex += "\n\n";
        }
        latex += "\\end{thebibliography}\n";
      }

      latex += "\\end{document}\n";

      return new NextResponse(latex, {
        headers: {
          "Content-Type": "application/x-latex; charset=utf-8",
          "Content-Disposition": `attachment; filename="${publication.title.replace(/[^a-zA-Z0-9]/g, "_")}.tex"`,
        },
      });
    }

    // Default: plain text
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${publication.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt"`,
      },
    });
  } catch (error) {
    console.error("Error exporting:", error);
    return NextResponse.json({ error: "Error al exportar" }, { status: 500 });
  }
}
