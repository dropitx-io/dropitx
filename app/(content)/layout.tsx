/**
 * Routes that decide HTTP status from data (a missing share is a 404, not a 200 with a
 * not-found screen). A route-level `loading.tsx` flushes a 200 shell before the page can
 * call `notFound()`, so these routes live outside the group that carries one.
 */
export { default } from "../(public)/layout";
