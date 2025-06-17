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

  // PERBAIKAN: Workbox configuration untuk offline yang proper
  if (isProduction) {
    config.plugins.push(
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        // PENTING: Offline fallback
        navigateFallback: '/story-sharing-app/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        // Cache essential files
        additionalManifestEntries: [
          { url: '/story-sharing-app/', revision: '1' },
          { url: '/story-sharing-app/index.html', revision: '1' },
          { url: '/story-sharing-app/manifest.json', revision: '1' },
        ],
        runtimeCaching: [
          // API requests - Network First (with offline fallback)
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              networkTimeoutSeconds: 3,
            },
          },
          // Images - Cache First
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          // Fonts and CSS - Stale While Revalidate
          {
            urlPattern: /\.(?:css|woff|woff2|ttf|eot)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
            },
          },
          // External resources (maps, etc.)
          {
            urlPattern: /^https:\/\/.*\.(?:openstreetmap|leafletjs)\.org\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "external-resources",
            },
          }
        ],
      })
    );
  }

  return config;
};