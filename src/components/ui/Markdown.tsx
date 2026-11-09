import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

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
          img: ({ src, alt }) => {
            if (!src || typeof src !== "string") return null;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt || ""} loading="lazy" />
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
