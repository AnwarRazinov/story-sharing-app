const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const WorkboxPlugin = require("workbox-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  const config = {
    entry: "./src/js/index.js",
    output: {
      path: path.resolve(__dirname, "docs"),
      filename: "bundle.[contenthash].js",
      clean: true,
      publicPath: process.env.NODE_ENV === 'production' ? '/story-sharing-app/' : '/'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.html",
        filename: "index.html",
      }),
      new Dotenv(),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "public/manifest.json",
            to: "manifest.json",
          },
          {
            from: "public/service_worker.js",
            to: "service-worker.js",
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
    devServer: {
      static: [
        {
          directory: path.join(__dirname, "docs"),
        },
        {
          directory: path.join(__dirname, "public"),
          publicPath: "/",
        },
      ],
      compress: true,
      port: 9000,
      hot: true,
      historyApiFallback: true,
    },
  };

  if (isProduction) {
    config.plugins.push(
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /https:\/\/story-api\.dicoding\.dev\/v1/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60,
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      })
    );
  }

  return config;
};