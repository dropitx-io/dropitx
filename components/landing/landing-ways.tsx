import { reveal } from "@/components/landing/reveal";

/** "Four ways to drop a file": browser, editor, CLI and agent, each with its fragment. */
export function LandingWays({ host }: { host: string }) {
  return (
    <section className="sec tone-warm" id="ways" aria-labelledby="ways-title">
      <div className="wrap">
        <div className="section-head" data-reveal>
          <h2 className="h-section" id="ways-title">Four ways to drop a file</h2>
          <p className="lead">Use whichever is closest to where the file already lives. Every route ends at the same short link.</p>
        </div>
        <div className="ways">
          <article className="card card-pad way" data-reveal>
            <h3 className="h-title">Drag it into the browser</h3>
            <p>Drop a .md or .html file anywhere on {host}. Other files, up to 50 MB each, are shared as downloads.</p>
            <div className="way-fig dropzone" aria-hidden="true">
              <strong>Drop a file to preview it</strong>Markdown, HTML or text, up to 50 MB
            </div>
          </article>
          <article className="card card-pad way" data-reveal style={reveal(1)}>
            <h3 className="h-title">Write it in the editor</h3>
            <p>Type Markdown on the left and read the rendered page on the right, then share it without saving a file first.</p>
            <div className="way-fig mini-editor" aria-hidden="true">
              <div className="editor-dark">
                <pre><span className="k"># Standup, Friday</span>{"\n"}<span className="s">-</span> Ship the <span className="e">**CSV fix**</span>{"\n"}<span className="s">-</span> Review <span className="n">`plan.md`</span></pre>
              </div>
              <div className="paper doc">
                <p className="doc-h1">Standup, Friday</p>
                <ul><li>Ship the <strong>CSV fix</strong></li><li>Review <code>plan.md</code></li></ul>
              </div>
            </div>
          </article>
          <article className="card card-pad way" data-reveal>
            <h3 className="h-title">Pipe it from the CLI</h3>
            <p>Install <code>dropitx</code> from npm, then upload a file or pipe any command&apos;s output straight into a link.</p>
            <div className="way-fig editor-dark">
              <pre><span className="c">$</span> cat log.txt | dropitx text{"\n"}<span className="s">https://{host}/s/log-82mq</span></pre>
            </div>
          </article>
          <article className="card card-pad way" data-reveal style={reveal(1)}>
            <h3 className="h-title">Hand it to an agent</h3>
            <p>The same package runs as an MCP server over stdio, so Claude Desktop, Cursor and other clients can share for you.</p>
            <div className="way-fig editor-dark">
              <pre>{"{ "}<span className="n">&quot;mcpServers&quot;</span>{": { "}<span className="n">&quot;dropitx&quot;</span>{": {\n    "}<span className="n">&quot;command&quot;</span>{": "}<span className="s">&quot;npx&quot;</span>{", "}<span className="n">&quot;args&quot;</span>{": ["}<span className="s">&quot;-y&quot;</span>{", "}<span className="s">&quot;dropitx&quot;</span>{", "}<span className="s">&quot;mcp&quot;</span>{"] } } }"}</pre>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
