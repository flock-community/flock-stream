const express = require("express");
const {createProxyMiddleware} = require('http-proxy-middleware');

const { port } = require("../server")

module.exports = function (app) {
    const proxy = createProxyMiddleware({
        target: `http://localhost:${port}`,
        changeOrigin: true,
    })
    app.use('watch.js', express.static(__dirname + "/public/watch.js"));
    app.use('watch.html', express.static(__dirname + "/public/watch.html"));
    app.use('/socket', proxy);
    app.use('/socket.io', proxy);
};