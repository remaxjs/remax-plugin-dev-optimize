import path from "path";
import resolve from "enhanced-resolve";
import {PluginOptions} from "../options";

const enhancedResolve = resolve.create.sync({
  extensions: ['.ts', '.js', '.json'],
  mainFields: ['module', 'main'],
});

const defaultRemaxDeps = ['react-reconciler',
  '@alipay/remix-framework-shared',
  '@alipay/remix-runtime',
  '@remax/framework-shared', '@remax/runtime'];

export function getDependencies(cwd: string): Array<string> {
  // 从 package.json 中读取 dependencies
  let dependencies = require(path.join(cwd, 'package.json')).dependencies;

  // 合并数组
  dependencies = Object.keys(dependencies).concat(defaultRemaxDeps);

  return dependencies;
}

export interface IDependency{
  packageName:string;
  resolvePath:string;
}

function getResolvedDependencies(cwd:string): Array<IDependency> {
  const deps = getDependencies(cwd);

  return deps.map(it => {

    try {
      const resolvePath = enhancedResolve(cwd, it);

      if (!resolvePath) return null;

      return {
        packageName: it,
        resolvePath: './' + path.relative(cwd, resolvePath),
      }
    } catch (e) {
      return null;
    }
  }).filter(Boolean) as Array<IDependency>;
}

export function getExternals(cwd: string, options: PluginOptions) {
  const externals: {[key:string]: string} = {};
  let resolvedDeps = getResolvedDependencies(cwd);
  // 允许用户调整这个数组
  if (options.onModifyResolvedDeps) {
    resolvedDeps = options.onModifyResolvedDeps(resolvedDeps);
  }

  resolvedDeps.forEach(dep => {
    externals[dep.packageName] = `commonjs2 third_part/${dep.packageName}`;
  });

  return {
    externals,
    resolvedDeps
  };
}
