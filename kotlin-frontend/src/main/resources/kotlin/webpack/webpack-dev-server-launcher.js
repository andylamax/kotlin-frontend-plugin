#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

// the following will be replaced with inline json
var RunConfig = require('$RunConfig$');

var config = require(RunConfig.webPackConfig);

config.entry = [ "webpack-dev-server/client?http://localhost:" + RunConfig.port + "/", "webpack/hot/dev-server", config.entry ];

if (!config.plugins) {
    config.plugins = [];
}
config.plugins.push(new webpack.HotModuleReplacementPlugin());

if (!config.devServer) {
    config.devServer = {};
}

config.devServer.inline = true;


var devServer = new WebpackDevServer(
    webpack(config),
    {
        contentBase: RunConfig.contentPath,
        hot: true,
        setup: function(app) {
            app.get(RunConfig.shutDownPath, function(req, res) {
                res.json({ shutdown: 'ok' });
                devServer.close();
            });
        },
        proxy: {
            "**" : (RunConfig.contentPath) ? {
                target: RunConfig.proxyUrl,
                secure: false,
                bypass: function(req, res, proxyOptions) {
                    var file = path.join(RunConfig.contentPath, req.path);
                    if (fs.existsSync(file)) {
                        return req.path;
                    }
                }
            } : null
        }
    }
);
devServer.listen(RunConfig.port, 'localhost');