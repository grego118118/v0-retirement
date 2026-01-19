
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

async function main() {
    const slugToDelete = "introducing-premium-interface-2026"
    console.log(`Attempting to delete post with slug: ${slugToDelete}`)

    try {
        const result = await prisma.blogPost.delete({
            where: { slug: slugToDelete }
        })
        console.log(`Successfully deleted post: ${result.title}`)
    } catch (e: any) {
        if (e.code === 'P2025') {
            console.log('Post found not found in database (it may have already been deleted).')
        } else {
            console.error('Error deleting post:', e)
            process.exit(1)
        }

    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
