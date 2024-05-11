module.exports = {
    title: 'Ovee.js',
    description: 'Optionally reactive framework for server-side generated markup',
    base: '/ovee/',
    themeConfig: {
        theme: '@vuepress/vue',
        lastUpdated: 'Last Updated',
        nav: [
            { text: 'Guide', link: '/guide' },
            { text: 'Authors', link: 'https://www.owlsdepartment.com/', target:'_blank' },
            { text: 'GitHub', link: 'https://github.com/owlsdepartment/ovee', target:'_blank' }
        ],
        sidebarDepth: 2,
        displayAllHeaders: false,
        activeHeaderLinks: true,
        sidebar: [
            '/guide',
            '/components',
            '/component-decorators',
            '/modules',
            {
                title: 'Reactivity',
                collapsable: false,
                children: [
                    '/reactivity/overview',
                    '/reactivity/api',
                ]
            },
            '/typescript',
            '/addons',
            '/meta'
        ]
    }
}