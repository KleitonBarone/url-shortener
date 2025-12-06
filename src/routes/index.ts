import { Hono } from "hono";
import { redirectRoute } from "./redirect.js";
import { shortenRoute } from "./shorten.js";

/**
 * Main application with all routes mounted.
 */
const app = new Hono();

// Mount route handlers
app.route("/shorten", shortenRoute);
app.route("/", redirectRoute);

export default app;
