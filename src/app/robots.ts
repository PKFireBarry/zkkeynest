import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/_next/', '/admin/'],
    },
    sitemap: 'https://zkkeynest.com/sitemap.xml',
  }
}