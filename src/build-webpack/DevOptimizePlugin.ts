import {ConcatSource} from "webpack-sources";
import path from "path";
import md5 from 'md5';
import fs from 'fs-extra';
import {IBuildOptions} from "../options";
import webpack from "webpack";
import {common_styles, common_vendors, third_part} from "../constants";

export class DevOptimizePlugin {

  options:IBuildOptions;

  constructor(options: IBuildOptions) {
    this.options = options;
  }

  apply(compiler: webpack.Compiler) {
    // 参数获取
    const cwd = compiler.context;
    const distDir = compiler.options.output?.path as string;

    // 公共样式引用
    compiler.hooks.thisCompilation.tap('DevOptimizePlugin', compilation => {
      compilation.hooks.optimizeChunkAssets.tap('DevOptimizePlugin', () => {
        const hasVendors = fs.existsSync(path.join(cwd, `${third_part}/${common_vendors}.acss`));
        const hasStyles = fs.existsSync(path.join(cwd, `${third_part}/${common_styles}.acss`));
        const source = [
          hasVendors && `@import "${third_part}/${common_vendors}.acss";`,
          hasStyles && `@import "${third_part}/${common_styles}.acss";`,
        ].filter(Boolean).join('\n');

        compilation.assets['app.acss'] = new ConcatSource(source);
      });
    });


    // 阻止文件被emit
    compiler.hooks.emit.tapPromise('DevOptimizePlugin', async compilation => {
      const assets = Object.keys(compilation.assets);

      await Promise.all(
        assets.map(async asset => {
          const content = compilation.assets[asset].source();
          const hashcode = md5(content);

          const fileOutPath = path.join(distDir, asset);
          const buf = await fs.readFile(fileOutPath);
          const outHashCode = md5(buf);

          if (outHashCode === hashcode) {
            delete compilation.assets[asset];
          }
        })
      )

      console.log(Object.keys(compilation.assets))
    });
  }
}
