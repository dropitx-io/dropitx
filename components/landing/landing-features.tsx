import { body, displayS, head } from "@/components/landing/landing-styles";
import { cn } from "@/lib/utils";

const BANDS = [
  {
    id: "password",
    sentence: "Lock it with a password.",
    why: "Readers get a password prompt first; the page renders only after the right one.",
    on: true,
    fill: "has-checked:bg-surface",
  },
  {
    id: "expiry",
    sentence: "Let it expire on Friday.",
    why: "The link stops working on Friday 6 November at 18:00. From the CLI, say 1h, 7d or 1w.",
    on: false,
    fill: "has-checked:bg-(--tone-2)",
  },
  {
    id: "burn",
    sentence: "Burn it after the first read.",
    why: "One person sees the page. Everyone who opens the link after them is told it has been burned.",
    on: false,
    fill: "has-checked:bg-(--tone-3)",
  },
  {
    id: "encrypt",
    sentence: "Encrypt it before it leaves your browser.",
    why: "AES-256-GCM, with the key in the part of the link after #, which browsers never send to our server.",
    on: true,
    fill: "has-checked:bg-field has-checked:text-field-foreground",
  },
];

/**
 * Each feature is a sentence with a real switch. A native checkbox carries the
 * state, so the bands toggle without script; CSS `:has(:checked)` fills them.
 */
export function LandingFeatures() {
  return (
    <section id="features" aria-labelledby="feat-title" className="mt-(--section-gap)">
      <h2 id="feat-title" data-reveal className={cn(displayS, "mb-[clamp(32px,4vw,56px)] px-(--m)")}>
        Four switches on every link.
      </h2>
      {BANDS.map((b) => {
        const field = b.id === "encrypt";
        return (
          <label
            key={b.id}
            className={cn(
              "group grid min-h-[20vh] cursor-pointer grid-cols-12 items-center gap-x-(--gutter) px-(--m) py-6 transition-colors duration-200 max-[760px]:min-h-[132px] max-[760px]:grid-cols-[1fr_auto] max-[760px]:py-5",
              b.fill,
            )}
          >
            <span data-reveal className="col-span-10 block max-[760px]:col-span-1">
              <span
                id={`band-${b.id}`}
                className={cn(head, "block text-muted-foreground transition-colors group-has-checked:text-current")}
              >
                {b.sentence}
              </span>
              <span
                className={cn(
                  body,
                  "mt-2 hidden max-w-[44em] opacity-100 transition-opacity duration-300 group-has-checked:block starting:opacity-0",
                )}
              >
                {b.why}
              </span>
            </span>
            <input
              type="checkbox"
              role="switch"
              defaultChecked={b.on}
              aria-labelledby={`band-${b.id}`}
              className="peer sr-only"
            />
            <span
              data-ui
              aria-hidden="true"
              className={cn(
                "relative col-span-2 h-[1.15em] w-[2.3em] justify-self-end bg-(--tone-3) text-(length:--step-head) transition-colors peer-checked:bg-foreground peer-focus-visible:outline-3 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-current max-[760px]:col-span-1 max-[760px]:text-2xl",
                field && "peer-checked:bg-field-foreground",
              )}
            >
              <span
                className={cn(
                  "absolute top-[0.15em] left-[0.15em] size-[0.85em] bg-background transition-transform duration-200 ease-(--ease-standard) group-has-checked:translate-x-[1.15em]",
                  field && "group-has-checked:bg-field",
                )}
              />
            </span>
          </label>
        );
      })}
    </section>
  );
}
