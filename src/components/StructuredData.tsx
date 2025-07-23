import Script from 'next/script';

export default function StructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": "zKkeynest",
                "description": "Secure API key management tool with zero-knowledge encryption for developers and teams",
                "url": "https://zkkeynest.com",
                "applicationCategory": "DeveloperApplication",
                "operatingSystem": "Web Browser",
                "offers": [
                    {
                        "@type": "Offer",
                        "name": "Free Plan",
                        "price": "0",
                        "priceCurrency": "USD",
                        "description": "Up to 10 API keys with full encryption"
                    },
                    {
                        "@type": "Offer",
                        "name": "Pro Plan",
                        "price": "3",
                        "priceCurrency": "USD",
                        "billingDuration": "P1M",
                        "description": "Unlimited API keys with advanced features"
                    }
                ],
                "featureList": [
                    "Zero-knowledge encryption",
                    "API key sharing",
                    "Rotation reminders",
                    "Copy-safe views",
                    "One-time secure sharing",
                    "AES-256 encryption"
                ],
                "screenshot": "/logo.png"
            },
            {
                "@type": "Organization",
                "name": "zKkeynest",
                "url": "https://zkkeynest.com",
                "logo": "https://zkkeynest.com/logo.png",
                "description": "Secure API key management platform for developers",
                "foundingDate": "2024",
                "sameAs": []
            },
            {
                "@type": "WebSite",
                "name": "zKkeynest",
                "url": "https://zkkeynest.com",
                "description": "Secure API key management with zero-knowledge encryption",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://zkkeynest.com/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            }
        ]
    };

    return (
        <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}