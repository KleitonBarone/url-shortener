import "dotenv/config";
import type { ServerType } from "@hono/node-server";
import { serve } from "@hono/node-server";
import { config } from "./config/index.js";
import { prisma } from "./lib/prisma.js";
import app from "./routes/index.js";

// Re-export app for direct usage if needed
export default app;

/**
 * Starts the HTTP server on the specified port.
 * @param port - Port to listen on (defaults to config.port)
 * @returns The server instance for lifecycle management
 */
export function startServer(port: number = config.port): ServerType {
    const server = serve(
        {
            fetch: app.fetch,
            port,
        },
        (info) => {
            console.log(`Server is running on http://localhost:${info.port}`);
        },
    );
    return server;
}

/**
 * Gracefully shuts down the server and disconnects from the database.
 * @param signal - The signal or event name that triggered the shutdown
 * @param server - The server instance to close (optional)
 * @param error - The error or rejection reason (optional)
 */
async function gracefulShutdown(
    signal: string,
    server?: ServerType,
    error?: unknown,
): Promise<void> {
    console.log(`\nShutdown triggered: ${signal}`);

    if (error) {
        console.error("Error details:", error);
    }

    try {
        if (server) {
            server.close();
            console.log("Server closed.");
        }
        await prisma.$disconnect();
        console.log("Database disconnected. Goodbye!");
    } catch (shutdownError) {
        console.error("Error during shutdown:", shutdownError);
    }

    process.exit(error ? 1 : 0);
}

// Start server when running directly (not imported by tests)
if (process.env.NODE_ENV !== "test") {
    const server = startServer();

    // External signals
    process.on("SIGINT", () => gracefulShutdown("SIGINT", server));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM", server));

    // Internal errors
    process.on("uncaughtException", (err) =>
        gracefulShutdown("uncaughtException", server, err),
    );
    process.on("unhandledRejection", (reason) =>
        gracefulShutdown("unhandledRejection", server, reason),
    );
}
