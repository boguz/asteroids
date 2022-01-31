import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: "src/asteroids.ts",
    output: {
      dir: "dist",
      format: "esm",
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json"
      })
    ]
  }
]
