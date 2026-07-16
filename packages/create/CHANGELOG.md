# @gentorial/create

## 0.2.0

### Minor Changes

- 2de2203: Require managed generation servers to rebuild author-controlled course content, prompts, and concepts from trusted manifests. Managed clients now send only course and generation IDs, a definition hash, learner preferences, and conversation state; legacy full-input requests are rejected.
- 3b571bf: Add an interactive, runnable managed-server scaffold with centralized provider and cache configuration, and remove the public mock generator and all generated-project mock fallbacks. Browser-only projects now surface a visible error until BYOK is configured. Require the host VitePress theme to be passed explicitly so independently installed theme packages build through VitePress's normal CSS pipeline.

## 0.1.2

### Patch Changes

- Add an explicit course option and scaffolding prompt for rendering raw AI-generated HTML.

## 0.1.1

### Patch Changes

- Allow learners to configure the model and Base URL for every browser BYOK provider while preserving the legacy full-endpoint option. Browser BYOK now supports incremental SSE output for initial lessons and follow-up answers. Remove generated-content validation and its extension hooks; accuracy and grounding remain prompt context while the runtime confines output to controlled renderers.

## 0.1.0

### Minor Changes

- Publish the first usable Gentorial framework release, including the interactive scaffolder, VitePress integration, learner preferences, BYOK generation pipeline, and default tutorial UI.
