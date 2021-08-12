import path from 'path';
import webpack from 'webpack';
import OptimizeEntriesPlugin from './OptimizeEntries';
import {targetExtensions} from "../utils/extensions";
import {IBuildOptions} from "../options";
import {common_styles, common_vendors, third_part} from "../constants";
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

export function prebuild(options: IBuildOptions) {
  const { cwd, externals, resolvedDeps } = options;

  const entrys: any = {};
  const resolvePaths: any = [];

  resolvedDeps.forEach(dep => {
    entrys[dep.packageName] = dep.resolvePath;
    resolvePaths.push(dep.resolvePath);
  });

  const compiler = webpack({
    mode: 'development',
    context: cwd,
    resolve: {
      alias: options.prebuildAlias || {
        'react-dom': '@remax/runtime'
      },
      extensions: targetExtensions('ali' as any),
    },
    entry: entrys,
    externals: externals,
    devtool: false,
    output: {
      path: path.resolve(cwd, `node_modules/${third_part}`), // string
      filename: '[name].js',
      libraryTarget: 'commonjs2',
      globalObject: 'my',
      jsonpFunction: 'commonLoader',
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            name: common_vendors,
            test: (...args) => {
              let id = args[0].rawRequest;
              if (resolvePaths.indexOf(id) > -1) {
                return false;
              }

              if (id && (id.indexOf('.less') > -1 || id.indexOf('.css') > -1)) {
                return false;
              }

              return true;
            }, // 匹配node_modules目录下的文件
            priority: 2, // 优先级配置项
            chunks: 'initial',
            minChunks: 2,
            minSize: 0,
          },
          styles: {
            name: common_styles,
            test: /(\.css|\.less|\.acss)$/,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.less$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].acss',
      }),
      new OptimizeEntriesPlugin(options),
    ],
  });

  compiler.run((error, stats) => {
    if (error) {
      console.error(error.message);
      throw error;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      info.errors.forEach(error => {
        console.error(error);
      });

      process.exit(1);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings.join('\n'));
    }
  });
}
