"use client";

import { stages } from "@/components/landing/how-stages";
import { reveal } from "@/components/landing/reveal";
import { useRovingTabs } from "@/components/landing/use-roving-tabs";

/**
 * "From file to readers in four steps": a vertical tab list (the timeline)
 * beside the selected step's illustration. Arrow keys, Home and End move
 * between steps. Without script the first step shows.
 */
export function LandingHow({ host }: { host: string }) {
  const list = stages(host);
  const { selected, tabProps } = useRovingTabs(list.length);

  return (
    <section className="sec" id="how" aria-labelledby="how-title">
      <div className="wrap">
        <div className="section-head" data-reveal>
          <h2 className="h-section" id="how-title">From file to readers in four steps</h2>
        </div>
        <div className="how">
          <div className="timeline" role="tablist" aria-orientation="vertical" aria-label="Steps" data-reveal>
            {list.map((s, i) => (
              <button
                key={s.name}
                className="tl-step"
                id={`how-tab-${i}`}
                aria-controls={`how-panel-${i}`}
                style={{ "--c": s.color } as React.CSSProperties}
                data-testid={`landing-how-step-${i}`}
                {...tabProps(i)}
              >
                <span className="tl-dot" aria-hidden="true" />
                <span>
                  <span className="tl-name">{s.name}</span>
                  <span className="tl-title">{s.title}</span>
                  <span className="tl-text">{s.text}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="card-featured stage-card" data-reveal style={reveal(1)}>
            {list.map((s, i) => (
              <div key={s.name} className="stage-panel" role="tabpanel" id={`how-panel-${i}`} aria-labelledby={`how-tab-${i}`} hidden={selected !== i}>
                {s.panel}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
