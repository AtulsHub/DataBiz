import { cn } from "@/lib/utils";

/** Lightweight markdown renderer for seeded content (headings, paragraphs, lists). */
export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const blocks = content.trim().split(/\n\n+/);

  return (
    <div className={cn("prose-databiz", className)}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("## ")) {
          return <h2 key={i}>{trimmed.slice(3)}</h2>;
        }
        if (trimmed.startsWith("### ")) {
          return <h3 key={i}>{trimmed.slice(4)}</h3>;
        }
        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").map((line) => line.replace(/^- /, ""));
          return (
            <ul key={i}>
              {items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split("\n").map((line) => line.replace(/^\d+\.\s/, ""));
          return (
            <ol key={i} className="list-decimal pl-5 mb-[1.15rem]">
              {items.map((item, j) => (
                <li key={j} className="mb-1">
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          );
        }
        return <p key={i}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}
