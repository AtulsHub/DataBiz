import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

function figureClass(title?: string | null) {
  if (title === "half") return "post-figure post-figure--half";
  if (title === "wide") return "post-figure post-figure--wide";
  if (title === "card") return "post-figure post-figure--card";
  return "post-figure post-figure--full";
}

/** Renders markdown for blog, events, and other long-form bodies. */
export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const source = content.replace(/\r\n/g, "\n").trim();
  if (!source) return null;

  return (
    <div className={cn("prose-databiz", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const external = href?.startsWith("http");
            return (
              <a
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt, title }) => {
            if (!src || typeof src !== "string") return null;
            return (
              <figure className={figureClass(title)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt || ""} loading="lazy" />
                {alt && alt !== "Image" ? (
                  <figcaption>{alt}</figcaption>
                ) : null}
              </figure>
            );
          },
          code: ({ className: codeClass, children, ...props }) => {
            const isBlock = Boolean(codeClass);
            if (isBlock) {
              return (
                <code className={codeClass} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
