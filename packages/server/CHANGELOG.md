# @gentorial/server

## 0.2.0

### Minor Changes

- 2de2203: Add independent context and generation resource limits. The runtime rejects over-budget active paths without trimming conversation history, managed handlers enforce request/input/follow-up/output limits before caching, streams stop on oversized output, and provider generators accept a portable maximum output token setting.
- 2de2203: Require managed generation servers to rebuild author-controlled course content, prompts, and concepts from trusted manifests. Managed clients now send only course and generation IDs, a definition hash, learner preferences, and conversation state; legacy full-input requests are rejected.

### Patch Changes

- Updated dependencies [2de2203]
- Updated dependencies [2de2203]
- Updated dependencies [3b571bf]
  - @gentorial/ai@0.3.0

## 0.1.0

### Minor Changes

- Introduce the Gentorial server package with managed provider credentials, a framework-neutral generation service, in-memory caching, and persistent file caching.

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies [1bb4bd4]
  - @gentorial/ai@0.2.0
  - @gentorial/core@0.1.1
