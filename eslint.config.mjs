import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // React Compiler-oriented hook rules (purity/immutability) assume every
    // hook return value and every render-phase call is React-managed. R3F's
    // whole imperative model — mutating `camera`/materials from useThree()
    // inside a useFrame callback that runs on the WebGL render loop, not
    // React's render phase — is a deliberate, standard exception to that.
    // Scoped off here rather than disabled globally.
    files: ["components/three/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
  {
    // Client-only pointer-capability detection: must default to "disabled"
    // for the server/first-client render (avoiding a hydration mismatch),
    // then flip on after mount — the canonical use of setState inside an
    // effect for this exact case.
    files: ["components/shell/CustomCursor.tsx"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
