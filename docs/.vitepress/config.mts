import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Civix",
  description: "Civic ticket Reporting Platform - SIH 2025",
  ignoreDeadLinks: [
    // Ignore localhost URLs (development only)
    /^http:\/\/localhost/,
    // Ignore missing links that will be created later
    /\/development\/build-deploy/,
    /\/development\/testing/,
    /\/components\/server/,
    /\/api\/authentication/,
    /\/api\/tickets/,
    /\/api\/users/,
    /\/api\/analytics/,
    /\/database\/user-schema/,
    /\/database\/ticket-schema/,
    /\/database\/authority-schema/,
    /\/user-guides\/technicians/
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/overview' },
      { text: 'Components', link: '/components/overview' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Architecture Overview', link: '/guide/architecture' },
          { text: 'Quick Start', link: '/guide/getting-started' },
          { text: 'Installation', link: '/guide/installation' }
        ]
      },
      {
        text: 'Components',
        items: [
          { text: 'Overview', link: '/components/overview' },
          { text: 'Web Client', link: '/components/web-client' },
          { text: 'Mobile App', link: '/components/mobile-app' },
          { text: 'Server', link: '/components/server' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/overview' },
          { text: 'Authentication', link: '/api/authentication' },
          { text: 'tickets & Tickets', link: '/api/tickets' },
          { text: 'Users & Roles', link: '/api/users' },
          { text: 'Analytics', link: '/api/analytics' }
        ]
      },
      {
        text: 'Database',
        items: [
          { text: 'Schema Overview', link: '/database/overview' },
          { text: 'User Schema', link: '/database/user-schema' },
          { text: 'Ticket Schema', link: '/database/ticket-schema' },
          { text: 'Authority Schema', link: '/database/authority-schema' }
        ]
      },
      {
        text: 'Development',
        items: [
          { text: 'Development Setup', link: '/development/setup' },
          { text: 'Build & Deploy', link: '/development/build-deploy' },
          { text: 'Testing', link: '/development/testing' },
          { text: 'Contributing', link: '/development/contributing' }
        ]
      },
      {
        text: 'User Guides',
        items: [
          { text: 'For Citizens', link: '/user-guides/citizens' },
          { text: 'For Administrators', link: '/user-guides/administrators' },
          { text: 'For Technicians', link: '/user-guides/technicians' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/swrno/civix' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Civix Team - SIH 2025'
    },

    search: {
      provider: 'local'
    }
  }
})
