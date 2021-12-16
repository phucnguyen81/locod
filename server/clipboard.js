function onConnection(socket) {
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

  const context = {
    timeout: 2000,
    timer: null,
    text: null,
  };

  socket.on("disconnect", () => {
    if (context.timer) {
      clearTimeout(context.timer);
    }
  });
  socket.on("notify-clipboard", () => {
    context.timer = setTimeout(function run() {
      const text = clipboard.readSync();
      if (text !== undefined && text !== context.text) {
        context.text = text;
        socket.emit("clipboard:text", context.text);
      }
      context.timer = setTimeout(run, context.timeout);
    }, context.timeout);
  });
  socket.on("stop-notify-clipboard", () => {
    if (context.timer) {
      clearTimeout(context.timer);
    }
  });
}

module.exports = onConnection;
