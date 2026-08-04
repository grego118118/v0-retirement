import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const root = process.cwd()
const PROD_URL = "https://www.masspension.com"

export interface BlogPost {
    slug: string
    frontMatter: {
        title: string
        description: string
        date: string
        readTime: string
        author: string
        authorTitle?: string
        category: string
        tags: string[]
        image?: string
        status?: 'published' | 'draft'
    }
    content: string
}

export const getPostBySlug = async (slug: string): Promise<BlogPost> => {
    const realSlug = slug.replace(/\.mdx$/, '')
    const filePath = path.join(root, 'content/blog', `${realSlug}.mdx`)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContent)

    return {
        slug: realSlug,
        frontMatter: data as BlogPost['frontMatter'],
        content
    }
}

export const getAllPosts = (): BlogPost[] => {
    const files = fs.readdirSync(path.join(root, 'content/blog'))

    const posts = files.map((slug) => {
        const source = fs.readFileSync(path.join(root, 'content/blog', slug), 'utf8')
        const { data } = matter(source)

        return {
            slug: slug.replace(/\.mdx$/, ''),
            frontMatter: data as BlogPost['frontMatter'],
            content: ''
        }
    })

    // Sort posts by date
    return posts.sort((a, b) => {
        return new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime()
    })
}

export const getTableOfContents = (content: string) => {
    const headings: { text: string; level: number; slug: string }[] = []
    // Simple regex to find headings - creates a basic TOC
    // For production usage with MDX, often better to use a remark plugin like remark-toc or rehype-slug
    const regex = /^(#{2,3})\s+(.*)$/gm
    let match

    while ((match = regex.exec(content)) !== null) {
        const level = match[1].length
        const text = match[2]
        const slug = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')

        headings.push({ text, level, slug })
    }

    return headings
}
