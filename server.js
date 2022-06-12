const express = require("express")
const compression = require("compression")
const { createProxyMiddleware } = require("http-proxy-middleware")
const history = require('connect-history-api-fallback');

const PORT = 8080
// const TARGET = "http://localhost:3000/"
const TARGET = "http://123.207.32.32:9001/"

const app = express()
app.use(compression())
app.use(history()); 
app.use(express.static("dist"))

// 路径以 '/api' 的配置(development)
// const apiProxy = createProxyMiddleware("/api/**", {
//   target: "http://localhost:3000",
//   changeOrigin: true,
//   pathRewrite: {
//     "^/api": "",
//   },
// })

// 路径以 '/' 的配置(production)
const apiProxy = createProxyMiddleware('/**', {
  target: TARGET,
  changeOrigin: true
});

app.use(apiProxy)
app.listen(PORT, (err) => {
  if (err) {
    console.log("err :", err)
  } else {
    console.log(`Listen at ${TARGET}`)
  }
})
