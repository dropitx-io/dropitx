import type { TeamEvent } from "@/types/team-event";
import { formatEventDescription, formatRelativeTime } from "@/lib/team-event-utils";
import { PersonAvatar } from "@/components/team/person-avatar";

/** Events whose description starts with what the actor did, so it reads "Linh Tran invited ...". */
const ACTOR_VERB_EVENTS = new Set([
  "invite.created",
  "invite.sent",
  "invite.revoked",
  "member.role_changed",
  "member.removed",
  "share.added",
  "share.removed",
]);

interface TeamActivityFeedProps {
  events: TeamEvent[];
  /** Display names by user id, to name the person behind each event. */
  names: Record<string, string>;
}

export function TeamActivityFeed({ events, names }: TeamActivityFeedProps) {
  if (events.length === 0) {
    return (
      <p className="flex min-h-[38px] items-center rounded-lg border border-dashed border-input px-3 text-sm text-muted-foreground">
        Nothing has happened in this team yet.
      </p>
    );
  }

  return (
    <ol className="grid gap-2">
      {events.map((event) => {
        const actor = event.user_id ? names[event.user_id] : undefined;
        const description = formatEventDescription(event.event_type, event.payload);
        const withActor = actor && ACTOR_VERB_EVENTS.has(event.event_type);
        return (
          <li
            key={event.id}
            className="grid min-h-[60px] grid-cols-[28px_minmax(0,1fr)] items-center gap-x-3 rounded-lg border border-border px-3.5 py-2.5 sm:grid-cols-[28px_minmax(0,1fr)_auto]"
          >
            <PersonAvatar id={event.user_id ?? event.id} name={actor ?? "?"} pending={!actor} />
            <p className="text-sm text-card-foreground">
              {withActor ? (
                <>
                  <b className="font-medium">{actor}</b> {description.charAt(0).toLowerCase() + description.slice(1)}
                </>
              ) : (
                description
              )}
            </p>
            <time dateTime={event.created_at} className="col-start-2 text-xs whitespace-nowrap text-muted-foreground tabular-nums sm:col-start-3">
              {formatRelativeTime(event.created_at)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
