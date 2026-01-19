
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Manually load .env
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

async function main() {
    try {
        console.log('Connecting to database...')
        const url = process.env.DATABASE_URL
        console.log(`Database URL loaded: ${url ? 'Yes ' + url.substring(0, 15) + '...' : 'No'}`)

        // Test a simple query
        const userCount = await prisma.user.count()
        console.log(`Successfully connected! Found ${userCount} users.`)

        // Check for blog posts
        const posts = await prisma.blogPost.findMany({
            select: { title: true, id: true, status: true }
        })
        console.log(`Found ${posts.length} blog posts in database:`)
        posts.forEach(p => console.log(`- [${p.status}] ${p.title} (${p.id})`))


    } catch (e) {
        console.error('Connection failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
