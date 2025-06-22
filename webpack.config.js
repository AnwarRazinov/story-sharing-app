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
      publicPath: isProduction ? '/story-sharing-app/' : '/'
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
            from: "public/sw-dev.js",
            to: "sw-dev.js",
          }
        ],
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "public"),
      },
      compress: true,
      port: 9000,
      hot: true,
      historyApiFallback: true,
    },
  };

  // PRODUCTION: Workbox configuration to match your friend's setup
  if (isProduction) {
    config.plugins.push(
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        // This creates the workbox-precache-v2 cache like your friend's
        navigateFallback: '/story-sharing-app/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/, /\/api\//],
        
        // Cache names that match your friend's pattern
        cacheId: 'story-app',
        
        // Runtime caching strategies
        runtimeCaching: [
          // API responses cache
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-responses",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              networkTimeoutSeconds: 3,
            },
          },
          // Images cache
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "static-resources",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          // External resources
          {
            urlPattern: /^https:\/\/unpkg\.com\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "cdn-cache",
            },
          },
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "cdn-cache",
            },
          },
        ],
        
        // Include all build files in precache
        exclude: [/\.map$/, /manifest$/, /\.htaccess$/],
      })
    );
  }

  return config;
};