import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

export default [
  {
    input: `src/index.ts`,
    plugins: [
      esbuild(),
    ],
    output: [
      {
        dir: "dist",
        format: 'es',
        sourcemap: true,
        // exports: 'default',
      },
      {
        dir: "example/vue3/lib",
        format: 'es',
        sourcemap: true,
        // exports: 'default',
      },
    ]
  },
  {
    input: `src/index.ts`,
    plugins: [dts()],
    output: [
      {
        file: `dist/index.d.ts`,
        format: 'es',
      },
      {
        file: `example/vue3/lib/index.d.ts`,
        format: 'es',
      }
    ]
  }
];
