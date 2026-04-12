
import { SoftwareApplication, WithContext } from 'schema-dts';

export function CalculatorSchema() {
    const schema: WithContext<SoftwareApplication> = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Mass Pension Calculator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: 'Official Massachusetts State Retirement Board (MSRB) pension estimator for groups 1, 2, and 4. Calculates annual benefits, survivor options, and COLA adjustments.',
        featureList: [
            'Group 1, 2, and 4 Calculations',
            'Option A, B, and C Comparison',
            'COLA Projection',
            'Social Security Offset Estimation'
        ],
        screenshot: 'https://www.masspension.com/images/og-image.jpg',
        author: {
            '@type': 'Organization',
            name: 'Mass Pension',
            url: 'https://www.masspension.com'
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function FAQSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How is my Massachusetts state pension calculated?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Your pension is based on your age at retirement, your years of creditable service, and the average of your highest 3 consecutive years of salary (or highest 5 years if hired after April 2, 2012). The formula is: Age Factor × Years of Service × Average Salary."
                }
            },
            {
                "@type": "Question",
                "name": "What is the COLA cap for 2026?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "For 2026, the Massachusetts state COLA base remains at $13,000. With a 3% adjustment, the maximum increase is $390 per year. Some local systems have adopted higher bases (up to $18,000 or higher), but the state system remains capped."
                }
            },
            {
                "@type": "Question",
                "name": "What is the difference between Option A, B, and C?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Option A provides the maximum monthly benefit but leaves nothing to a beneficiary. Option B provides a slightly reduced benefit and returns any remaining annuity balance to beneficiaries. Option C provides the lowest monthly benefit but guarantees a lifetime survivor allowance (66%) for your spouse or beneficiary."
                }
            },
            {
                "@type": "Question",
                "name": "Does my pension affect my Social Security?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Massachusetts public employees do not pay into Social Security for their government earnings. This triggers the Windfall Elimination Provision (WEP) and Government Pension Offset (GPO), which can reduce your own or your spousal Social Security benefits."
                }
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
