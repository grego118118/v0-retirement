
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Manually load .env for safety
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^"|"$/g, '')
        }
    })
}

const prisma = new PrismaClient()

const newPosts = [
    {
        id: "ssfa-and-tax-bomb-tool-updates",
        title: "Major Updates to SSFA Auditor & Tax Bomb Defuser Tools",
        description: "In response to the Social Security Fairness Act repeal, we've updated our core calculators with new logic, cleaner interfaces, and precise 'Back-Pay' auditing features.",
        date: "January 18, 2026",
        content: `
      <h2>New Tools for a New Era</h2>
      <p>The recent passage of the <strong>Social Security Fairness Act</strong> has changed the landscape for Massachusetts public retirees. To keep pace with these legislative victories, we've rolled out significant updates to our two most critical specialized tools: the <a href="/ssfa-auditor">SSFA Back-Pay Auditor</a> and the <a href="/tax-bomb">Tax Bomb Defuser</a>.</p>

      <h2>The SSFA Back-Pay Auditor: Now Live</h2>
      <p>With the repeal of WEP (Windfall Elimination Provision) and GPO (Government Pension Offset), many retirees are owed retroactive benefits. Our updated **SSFA Auditor** now features:</p>
      <ul>
        <li><strong>Precise Back-Pay Calculations:</strong> Estimate your retroactive lump sum dating back to January 2024.</li>
        <li><strong>Clean, Authoritative Interface:</strong> We've moved away from the complex legacy design to a clean, step-by-step wizard that guides you through the audit process.</li>
        <li><strong>Real-Time Updates:</strong> As SSA implementation guidance evolves, our tool's logic updates automatically within 48 hours.</li>
      </ul>

      <h2>Defusing the "Tax Bomb" with Clarity</h2>
      <p>The "Tax Bomb"—the stealth tax shift that can hit retirees who exceed certain income thresholds—remains a complex issue. We've completely restyled the <a href="/tax-bomb">Tax Bomb Defuser</a> to make it less intimidating and more actionable.</p>
      <p>The new design uses clear visual signals (Green/Amber/Red) to indicate your risk level without using fear-based aesthetics. It's about empowerment through data.</p>

      <h2>Try the New Tools Today</h2>
      <p>These updates are part of our commitment to providing "Audit-as-a-Service" for state employees. We believe you shouldn't need a degree inactuarial science to understand your own benefits.</p>
      <p><a href="/ssfa-auditor" class="btn btn-primary">Launch SSFA Auditor</a> | <a href="/tax-bomb">Launch Tax Bomb Defuser</a></p>
    `,
        category: "Product Updates",
        tags: ["SSFA", "WEP elimination", "tax bomb", "tools", "update"],
        image: "/images/blog/ssfa-tax-bomb-update.png"
    },
    {
        id: "introducing-premium-interface-2026",
        title: "Experience the New Standard: Introducing MassPension's Premium Redesign",
        description: "We've completely overhauled our user experience with a new 'Transparency First' design system, enhanced clarity for pension options, and a unified aesthetic across all tools.",
        date: "January 15, 2026",
        content: `
      <h2>A Fresh Look for Trusted Data</h2>
      <p>We are proud to unveil a comprehensive redesign of MassPension.com. Our goal was simple: to make the most complex retirement data in the country feel as accessible as your favorite modern app.</p>

      <h2>The "Transparency First" Design System</h2>
      <p>You'll notice a significant shift in our visual language:</p>
      <ul>
        <li><strong>Premium Blue & Indigo Theme:</strong> We've adopted a cohesive color palette that reflects trust, stability, and authority. Gone are the mixed metaphors of dark modes and neon accents.</li>
        <li><strong>Glassmorphism & Depth:</strong> Our new interface uses subtle depth and transparency effects to organize complex information hierarchies, making it easier to scan large datasets.</li>
        <li><strong>Unified Experience:</strong> Whether you're on the <a href="/about">About page</a>, checking the <a href="/methodology">Methodology</a>, or running a calculation, the experience is seamless and consistent.</li>
      </ul>

      <h2>Spotlight on Methodology</h2>
      <p>Trust is earned by showing your work. Our new <a href="/methodology">Methodology Page</a> breaks down the "Black Box" of MSRB calculations into clear, color-coded formulas. We believe you should know exactly where every dollar in your estimate comes from.</p>

      <h2>What's Next?</h2>
      <p>This visual refresh sets the foundation for a suite of new "Pro" features coming later this year, including multi-scenario comparison and advanced beneficiary modeling.</p>
      <p>Explore the new site today and let us know what you think!</p>
    `,
        category: "Platform Updates",
        tags: ["update", "design", "user experience", "transparency", "methodology"],
        image: "/images/blog/premium-redesign-2026.png"
    }
]

async function main() {
    console.log('Starting seed...')

    for (const post of newPosts) {
        console.log(`Seeding post: ${post.title}`)
        await prisma.blogPost.upsert({
            where: { slug: post.id },
            update: {
                title: post.title,
                content: post.content,
                excerpt: post.description,
                featuredImageUrl: post.image,
                seoKeywords: post.tags,
                status: 'published',
                publishedAt: new Date(post.date),
            },
            create: {
                id: post.id,
                title: post.title,
                slug: post.id,
                content: post.content,
                excerpt: post.description,
                featuredImageUrl: post.image,
                seoKeywords: post.tags,
                status: 'published',
                publishedAt: new Date(post.date),
                authorId: null // or assign a default user ID if known
            }
        })
    }

    console.log('Seed completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
