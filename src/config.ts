import type { NavigationLink, Site } from './types.ts'

export const SITE: Site = {
    author: 'ShinMcCold',
    url: 'https://shinmccold.com',
    title: 'Shin McCold',
    description: 'ShinMcCold\'s personal blog, I enjoy the process of building something using any technology stack',
    shortDescription: '',
}

export const NavigationLinks: NavigationLink[] = [
    { name: 'Home', url: '/' },
    { name: 'Projects', url: '/projects' },
    { name: 'Timeline', url: '/timeline' },
    { name: 'Posts', url: '/posts' },
    { name: 'Category', url: '/categories' },
    { name: 'About', url: '/posts/about-shinmccold' },
]

export const FooterLinks = [
    {
        section: 'Contact',
        links: [
            { name: 'GitHub', url: 'https://github.com/shinmccold' },
            { name: 'Twitter', url: 'https://x.com/shinmccold1' },
        ],
    },
    {
        section: 'Other',
        links: [
            { name: 'Site Map', url: '/sitemap-index.xml' },
        ],
    },
]

export const Settings = {
    GoogleAnalytics: {
        enable: false,
        id: 'G-426M8D073B',
    },

    // See https://github.com/umami-software/umami
    UmamiAnalytics: {
        enable: true,
        dataWebsiteID: 'bea7fdd3-de1f-4b91-bcff-8be3816f7e2e',
    },

    Comment: {
        // todo: should I use meta or process?
        // process reports an error when used locally,
        // and meta cannot retrieve environment variables in Cloudflare environment.
        // enable: !!(import.meta.env.COMMENT_ENABLE),
        enable: true,

        // please visit https://giscus.app/ to learn how to configure it.
        giscus: {
            repo: 'shinmccold/shinmccold.github.io',
            repoId: 'MDEwOlJlcG9zaXRvcnk5MDgzNzMzMw==',
            category: 'General',
            categoryId: 'DIC_kwDOBWoRVc4CkUcX',
            darkThem: 'noborder_gray',
            lightThem: 'light',
        },
    },

    Assets: {
        // If you don't want to upload the build assert(image/js/css/etc...) to anywhere, just set this to false
        uploadAssetsToS3: false,
        config: {
            // see https://github.com/syhily/astro-uploader to get how to configure the uploader,
            // The following configuration will upload the compiled `assets` folder to S3 or R2.
            // You can set a separate domain for it so that you can access all resources using a CDN domain name.
            //
            // For example: https://images.shinmccold.com/gblog/assets/brand-logo.webp
            //
            // Note that you may also need to modify `build.assetsPrefix` in `astro.config.mjs` if you want to
            // automatically replace all images/js/css with a CDN link.
            paths: ['assets'],
            // endpoint: process.env.S3_ENDPOINT as string,
            // bucket: process.env.S3_BUCKET as string,
            // accessKey: process.env.S3_ACCESS_KEY as string,
            // secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
            root: 'gblog',
        },
    },
}

export const SEO = {
    title: SITE.title,
    description: SITE.description,
    structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'inLanguage': 'en-US',
        '@id': SITE.url,
        'url': SITE.url,
        'name': SITE.title,
        'description': SITE.description,
        'isPartOf': {
            '@type': 'WebSite',
            'url': SITE.url,
            'name': SITE.title,
            'description': SITE.description,
        },
    },
}
