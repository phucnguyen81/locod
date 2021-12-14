const liveReload = require("livereload");
const liveReloadServer = liveReload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

const connectLiveReload = require("connect-livereload");
module.exports = connectLiveReload;