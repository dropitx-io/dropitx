import { CopyCodeButton } from "@/components/copy-install-button";

/**
 * The design's `codeblock`: a dark header naming the shell or file, a Copy
 * button that copies `copy` (the runnable command, not the sample output),
 * and the highlighted body passed as children.
 */
export function CodeBlock({ title = "Terminal", copy, testId, children }: { title?: string; copy: string; testId?: string; children: React.ReactNode }) {
  return (
    <div className="codeblock editor-dark">
      <div className="cb-head">
        <span>{title}</span>
        <CopyCodeButton text={copy} testId={testId} />
      </div>
      <pre><code>{children}</code></pre>
    </div>
  );
}

/** A prompt line: a dimmed "$" before the command. */
export function Cmd({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className="c">$</span> {children}
      {"\n"}
    </>
  );
}

/** A line of output, dimmed (`c`), as a link (`s`) or as a flag (`e`). */
export function Out({ tone = "c", last = false, children }: { tone?: "c" | "s" | "e"; last?: boolean; children: React.ReactNode }) {
  return (
    <>
      <span className={tone}>{children}</span>
      {!last && "\n"}
    </>
  );
}
