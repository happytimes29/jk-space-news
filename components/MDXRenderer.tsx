import { MDXRemote } from "next-mdx-remote/rsc";
import { CodeBlock } from "@/components/CodeBlock";

interface Props {
  source: string;
}

const components = {
  // Custom code block with copy button
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
    const child = (children as React.ReactElement<{ className?: string; children?: string }>);
    const className = child?.props?.className || "";
    const language = className.replace("language-", "") || "text";
    const code = child?.props?.children?.toString() || "";
    const isPrompt = language === "prompt" || language === "ai-prompt";

    return <CodeBlock code={code} language={language} isPrompt={isPrompt} />;
  },
  code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
    // Inline code — not inside pre
    if (!className) {
      return (
        <code
          className="font-mono text-sm bg-[#0A0A0A] border border-[#1a1a1a] text-[#60a5fa] px-1.5 py-0.5 rounded"
          {...props}
        >
          {children}
        </code>
      );
    }
    return <code className={className} {...props}>{children}</code>;
  },
};

export function MDXRenderer({ source }: Props) {
  return <MDXRemote source={source} components={components} />;
}
