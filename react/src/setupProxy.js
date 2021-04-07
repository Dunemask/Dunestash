const createProxyMiddleware = require("http-proxy-middleware");
const { serverAddress } = require("./api.json");
module.exports = (app) => {
  app.use(
    "/api",
    createProxyMiddleware({
      target: serverAddress,
      changeOrigin: true,
      logLevel: "silent",
    })
  );
};
