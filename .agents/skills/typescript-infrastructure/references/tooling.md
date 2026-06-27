# TypeScript Infrastructure & Tooling Reference

## 1. Strict & Performant `tsconfig.json` Base
A standard "Strictest but Fast" base configuration for modern (ESM + Bundler) applications.

```json
{
  "compilerOptions": {
    /* Target & Modules */
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    
    /* Performance */
    "incremental": true,           // Caches type-checking to drastically improve re-runs
    "skipLibCheck": true,          // Skips checking node_modules definitions (massive speed boost)
    "isolatedModules": true,       // Ensures safe transpilation by tools like Babel/SWC/Vite

    /* Strictest Type-Checking */
    "strict": true,                // Enables all strict flags (noImplicitAny, strictNullChecks, etc.)
    "noUncheckedIndexedAccess": true, // Arrays and Dictionaries return 'T | undefined' (critical safety)
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    
    /* Paths (Optional, requires bundler setup) */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

## 2. Diagnosing Slow Builds via CLI
Before guessing why a build is slow, measure it using TypeScript's built-in profiler.

```bash
# 1. Print simple extended diagnostics (shows time spent parsing vs typechecking)
npx tsc --noEmit --extendedDiagnostics

# 2. Generate a full CPU trace (if the above doesn't yield enough insight)
npx tsc --noEmit --generateTrace traceDir
# Then use: npx @typescript/analyze-trace traceDir
```

## 3. Monorepo Project References
When dealing with workspaces (Turborepo, Nx, or generic pnpm/yarn workspaces), `tsconfig` project references must be configured to link packages securely.

**In the shared package (e.g., `packages/ui/tsconfig.json`):**
```json
{
  "compilerOptions": {
    "composite": true,       // CRITICAL: Tells TS this directory will be referenced by another
    "declaration": true,     // Must emit .d.ts files for the consumer to read
    "declarationMap": true   // Allows IDE "Go To Definition" to hit the source .ts file 
  }
}
```

**In the consumer app (e.g., `apps/web/tsconfig.json`):**
```json
{
  "compilerOptions": { ... },
  "references": [
    { "path": "../../packages/ui" }
  ]
}
```

## 4. Modern Linter Strategy: Choosing Biome over ESLint
When speed and ease of setup are paramount, migrate to [Biome](https://biomejs.dev/).
1. **Speed:** Biome is written in Rust and lints/formats massive codebases in milliseconds.
2. **All-in-one:** Replaces `eslint` + `prettier` + custom plugins.
3. **Setup:**
   ```bash
   npx @biomejs/biome init
   # Add to package.json scripts: "lint": "biome check --write ."
   ```
*Caveat: Stay on ESLint/Prettier if the project relies heavily on framework-specific esoteric linting plugins that Biome has not ported yet.*
