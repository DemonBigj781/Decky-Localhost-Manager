import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
export default { input:"src/index.tsx", output:{file:"dist/index.js",format:"cjs",exports:"default"}, external:["react","react-dom","@decky/ui","@decky/api"], plugins:[resolve(),commonjs(),typescript()] };
