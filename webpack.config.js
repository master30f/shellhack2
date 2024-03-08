const path = require("path");
const webpack = require("webpack");
const fs = require("fs")

const banner = fs.readFileSync(path.resolve(__dirname, "banner.txt")).toString();

module.exports = {
    mode: "development",
    optimization: {
        minimize: false
    },
    devtool: "source-map",
    entry: path.resolve(__dirname, "src", "index.js"),
    output: {
        path: path.resolve(__dirname, "out"),
        filename: "bundle.user.js",
    },
    plugins: [
        new webpack.BannerPlugin({
            banner,
            raw: true
        })
    ]
};