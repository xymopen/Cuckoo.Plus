import { readFileSync as readFile } from "node:fs";
import * as process from "node:process";
import { parseEnv } from "node:util";
import webpack from 'webpack';

/** @type {import('webpack-cli').CallableOption} */
export default (env, argv) => {
  const envName = argv.nodeEnv ?? process.env.NODE_ENV;

  const dotenvFiles = [
    ".env",
    ".env.local",
    ...(envName == null ? [] : [
      `.env.${envName}`,
      `.env.${envName}.local`
    ])
  ];

  const dotenv = dotenvFiles.reduce((env, filename) => {
    try {
      return Object.assign(
        env,
        parseEnv(readFile(filename, "utf-8"))
      )
    } catch {
      return env
    }
  }, {});

  const plugin = new webpack.EnvironmentPlugin([
    "DISPLAY_NAME"
  ])
  plugin.defaultValues = Object.assign(
    Object.fromEntries(plugin.keys.map(key => [key, ""])),
    dotenv
  )

  return {
    plugins: [
      plugin
    ]
  }
};
