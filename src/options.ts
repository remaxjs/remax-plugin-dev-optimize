import {IDependency} from "./utils/externals";

export interface PluginOptions {
  prebuildAlias?: {[key:string]:string};
  onModifyResolvedDeps?: (deps: Array<IDependency>) => Array<IDependency>;
}

export interface IBuildOptions {
  prebuildAlias?: {[key:string]:string};
  cwd: string;
  externals: {[key:string]: string};
  resolvedDeps: Array<IDependency>;
}
