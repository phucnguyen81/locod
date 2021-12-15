#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require("./app");
const debug = require("debug")("express-browser-reload:server");
const http = require("http");

/**
 * Have to use import() function here to load ES module `clipboardy`.
 * See: https://nodejs.org/api/esm.html#import-expressions
 */
const clipboard = {
  readSync() {
    return undefined;
  },
};
import("clipboardy")
  .then((module) => {
    const { readSync } = module.default;
    clipboard.readSync = readSync;
  })
  .catch((err) => console.error(err));

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Initialize Socket.io
 */
const { Server, Socket } = require("socket.io");
const io = new Server(server);
io.on("connection", (socket) => {
  const context = {
    clipboardTimer: null,
    clipboardText: null,
  };
  socket.on("disconnect", () => {
    if (context.clipboardTimer) {
      clearTimeout(context.clipboardTimer);
    }
  });
  socket.on("notify-clipboard", () => {
    context.clipboardTimer = setTimeout(function run() {
      const text = clipboard.readSync();
      if (text !== undefined && text !== context.clipboardText) {
        context.clipboardText = text;
        socket.emit("clipboard:text", context.clipboardText);
      }
      context.clipboardTimer = setTimeout(run, 2000);
    }, 2000);
  });
  socket.on("stop-notify-clipboard", () => {
    if (context.clipboardTimer) {
      clearTimeout(context.clipboardTimer);
    }
  });
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
