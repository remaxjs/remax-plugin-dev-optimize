import {getExternals} from "./utils/externals";
import {IBuildOptions, PluginOptions} from "./options";
import yargs from 'yargs';
import {prebuild} from "./prebuild-webpack";
import {DevOptimizePlugin} from "./build-webpack/DevOptimizePlugin";

export default function (options: PluginOptions) {
  const cwd = process.cwd();
  const { prebuildAlias } = options;
  const {
    externals, resolvedDeps
  } = getExternals(cwd, options);

  const buildOptions: IBuildOptions = {
    prebuildAlias,
    cwd,
    externals,
    resolvedDeps
  };

  return {
    extendCLI({cli}: { cli: yargs.Argv }) {
      cli.command(
        'prebuild',
        '依赖预构建',
        y => {
        },
        (args) => {
          prebuild(buildOptions)
        });
    },
    configWebpack({config}) {
      config.set('externals', [externals]);
      config.plugin('remax-dev-optimize').use(DevOptimizePlugin, [buildOptions]);
    }
  }
}
