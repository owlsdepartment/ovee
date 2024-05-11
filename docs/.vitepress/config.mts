import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Ovee.js",
  description: "Simple fully reactive framework for server-side generated markup",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Guide', link: '/guide/installation' },
      { text: 'API', link: '/api' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          base: '/guide',
          items: [
            { text: 'Installation', link: '/installation' },
            { text: 'Overview', link: '/overview' }
          ]
        },
        {
          text: 'Usage',
          base: '/guide/usage',
          items: [
            { text: 'App', link: '/app' },
            { text: 'Modules', link: '/modules' },
            { text: 'Components', link: '/components' },
            { text: 'Event Handling', link: '/event-handling' },
            { text: 'Reactivity', link: '/reactivity' },
            { text: 'Composables', link: '/composables' },
            { text: 'JSX', link: '/jsx' },
          ]
        },
        {
          text: 'Built-in',
          base: '/guide/built-in',
          items: [
            { text: 'useAttribute', link: '/use-attribute' },
            { text: 'useDataAttr', link: '/use-data-attr' },
            { text: 'useElementRef', link: '/use-element-ref' },
            { text: 'useModule', link: '/use-module' },
            { text: 'useProp', link: '/use-prop' },
            { text: 'useQueryComponent', link: '/use-query-component' },
            { text: 'useQuerySelector', link: '/use-query-selector' },
            { text: 'useSlots', link: '/use-slots' },
            { text: 'useTemplate', link: '/use-template' },
          ]
        }
      ],
      '/api/': [],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
