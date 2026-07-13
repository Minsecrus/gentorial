import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'

let diagramSequence = 0

export const GentorialMermaid = defineComponent({
  name: 'GentorialMermaid',
  props: {
    graph: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const container = ref<HTMLElement>()
    let observer: MutationObserver | undefined
    let renderSequence = 0

    async function renderDiagram(): Promise<void> {
      const target = container.value
      if (!target) return
      const currentRender = ++renderSequence
      target.setAttribute('aria-busy', 'true')

      try {
        const { default: mermaid } = await import('mermaid')
        const dark = document.documentElement.classList.contains('dark')
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: dark ? 'dark' : 'default'
        })
        const id = `gentorial-mermaid-${++diagramSequence}`
        const { svg, bindFunctions } = await mermaid.render(id, props.graph)
        if (currentRender !== renderSequence || container.value !== target) return
        target.innerHTML = svg
        bindFunctions?.(target)
        target.removeAttribute('aria-busy')
      } catch (error) {
        if (currentRender !== renderSequence || container.value !== target) return
        target.textContent = error instanceof Error ? error.message : 'Mermaid 图示解析失败'
        target.setAttribute('data-error', 'true')
        target.removeAttribute('aria-busy')
      }
    }

    onMounted(() => {
      void renderDiagram()
      observer = new MutationObserver(() => { void renderDiagram() })
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    })
    onBeforeUnmount(() => {
      renderSequence += 1
      observer?.disconnect()
    })
    watch(() => props.graph, () => { void renderDiagram() })

    return () => h('div', {
      ref: container,
      class: 'gentorial-mermaid',
      role: 'img',
      'aria-label': 'Mermaid 图示'
    })
  }
})
