## remax 开发提速工具
当前仅支持支付宝，能大幅度提升大型项目的构建速度

1. remax.config.js 里增加插件配置
```jsx
const optimize = require('@remax/plugin-dev-optimize');

module.exports = {
  output: 'build',
  plugins: [
    optimize({})
  ]
};
```
2. 先执行 `remax prebuild` 进行依赖预构建

3. 正常执行 remax build -w -t ali
