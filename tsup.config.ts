import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["components/ui/index.ts"], // Update with the correct entry file
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  clean: true,
  sourcemap: true
});
