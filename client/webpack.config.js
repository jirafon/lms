import path from 'path';
import webpack from 'webpack';
import dotenv from 'dotenv';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.local'), override: true });

export default (_, argv) => {
  const isProduction = argv.mode === 'production';
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3010/api/v1';
  const shouldGenerateSourceMap = !isProduction || process.env.GENERATE_SOURCEMAP === 'true';
  const devtool = shouldGenerateSourceMap
    ? isProduction
      ? 'source-map'
      : 'eval-cheap-module-source-map'
    : false;

  return {
    mode: isProduction ? 'production' : 'development',
    entry: path.resolve(__dirname, 'src/main.jsx'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'assets/[name].[contenthash].js' : 'assets/[name].js',
      assetModuleFilename: 'assets/[name].[contenthash][ext][query]',
      publicPath: '/',
      clean: true,
    },
    devtool,
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },
    parallelism: isProduction ? 4 : undefined,
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          resolve: {
            fullySpecified: false,
          },
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults' }],
                ['@babel/preset-react', { runtime: 'automatic', development: !isProduction }],
              ],
            },
          },
        },
        {
          test: /\.css$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|webp|ico|woff2?|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
        'process.env.REACT_APP_API_BASE_URL': JSON.stringify(apiBaseUrl),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'index.html'),
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'public'),
            to: path.resolve(__dirname, 'dist'),
            noErrorOnMissing: true,
            globOptions: {
              ignore: ['**/.DS_Store'],
            },
          },
        ],
      }),
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: 'assets/[name].[contenthash].css',
            }),
          ]
        : []),
    ],
    devServer: {
      host: '0.0.0.0',
      port: Number(process.env.PORT) || 5173,
      historyApiFallback: true,
      hot: true,
      allowedHosts: 'all',
      static: {
        directory: path.resolve(__dirname, 'public'),
        publicPath: '/',
        watch: true,
      },
      client: {
        overlay: true,
      },
    },
    optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: 'all',
      },
      runtimeChunk: 'single',
    },
  };
};