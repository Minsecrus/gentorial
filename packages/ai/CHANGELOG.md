# @gentorial/ai

## 0.3.0

### Minor Changes

- 2de2203: Add independent context and generation resource limits. The runtime rejects over-budget active paths without trimming conversation history, managed handlers enforce request/input/follow-up/output limits before caching, streams stop on oversized output, and provider generators accept a portable maximum output token setting.
- 2de2203: Require managed generation servers to rebuild author-controlled course content, prompts, and concepts from trusted manifests. Managed clients now send only course and generation IDs, a definition hash, learner preferences, and conversation state; legacy full-input requests are rejected.
- 3b571bf: Add an interactive, runnable managed-server scaffold with centralized provider and cache configuration, and remove the public mock generator and all generated-project mock fallbacks. Browser-only projects now surface a visible error until BYOK is configured. Require the host VitePress theme to be passed explicitly so independently installed theme packages build through VitePress's normal CSS pipeline.

## 0.2.0

### Minor Changes

- Add server-managed provider generators and shared generation-result caching keyed by complete course input, learner preferences, and a versioned server generation namespace.

### Patch Changes

- 1bb4bd4: Preserve generated structure by treating browser streams as standard Markdown. Runtime Markdown is incrementally parsed into safe Vue nodes, retains its source through follow-up conversations and copy actions, and delegates Mermaid fences to the default VitePress theme without exposing author-defined custom containers to AI generation. Add a framework-neutral Web Standards server adapter with JSON lessons, SSE Markdown, authorization, error transport, and cancellation propagation.
- Updated dependencies
- Updated dependencies [1bb4bd4]
  - @gentorial/core@0.1.1

## 0.1.1

### Patch Changes

- Allow learners to configure the model and Base URL for every browser BYOK provider while preserving the legacy full-endpoint option. Browser BYOK now supports incremental SSE output for initial lessons and follow-up answers. Remove generated-content validation and its extension hooks; accuracy and grounding remain prompt context while the runtime confines output to controlled renderers.

## 0.1.0

### Minor Changes

- Publish the first usable Gentorial framework release, including the interactive scaffolder, VitePress integration, learner preferences, BYOK generation pipeline, and default tutorial UI.

### Patch Changes

- Updated dependencies
  - @gentorial/core@0.1.0
