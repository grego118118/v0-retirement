---
name: mass_pension_blog_writer
description: A specialized skill for researching, drafting, and publishing high-quality blog posts for MassPension.com.
---

# MassPension.com Blog Writing Skill

This skill provides a standardized workflow for creating content that resonates with Massachusetts state employees (MSRB members). It ensures all content is authoritative, data-driven, and aligned with the "Transparency First" brand aesthetic.

## 🎯 Audience Persona
- **Who:** Massachusetts public sector employees (Teachers, Police, Fire, State Workers).
- **Mindset:** Risk-averse, detail-oriented, skeptical of "financial advisors," trusts data over sales pitches.
- **Goal:** Maximizing their pension calculation, understanding hidden rules (WEP/GPO, COLA caps), and avoiding mistakes.

## 🎨 Tone & Style Guidelines
1.  **"The Helpful Actuary"**: Be precise, mathematical, and authoritative. Avoid generic fluff.
2.  **Transparency First**: Show the math. If you state a rule (e.g., "COLA is capped at $390"), explain *why* ($13k base * 3%).
3.  **Empathetic but Objective**: Acknowledge the complexity/stress of retirement, but solve it with clear facts.
4.  **Premium Aesthetic**: Use formatting that feels high-end. Short paragraphs, clear headers, bullet points for data.

## 📝 Content Structure Template

Every blog post MUST follow this structure to ensure compatibility with the `BlogPost` schema and UI components:

```typescript
{
  title: "Catchy, SEO-Optimized Title (e.g., 'The Truth About...')",
  slug: "kebab-case-keyword-rich-slug",
  description: "Meta description < 160 chars. The 'Hook'.",
  // Image should be generated using the 'generate_image' tool with the 'premium glassmorphism' prompt style.
  image: "/images/blog/your-image-name.png",
  tags: ["relevant", "keywords"],
  content: `
    <h2>The Core Problem</h2>
    <p>Define the issue clearly.</p>

    <h2>The Data-Driven Answer</h2>
    <p>Explain the solution using MSRB rules.</p>
    <ul>
      <li><strong>Fact 1:</strong> Detail...</li>
    </ul>

    <h2>How MassPension Helps</h2>
    <p>Direct the user to a specific tool:</p>
    <p><a href="/calculator" class="btn btn-primary">Run Your Numbers</a></p>
  `
}
```

## 🛠️ Workflow Steps

### 1. Research & Strategy
- Identify a topic related to: MSRB Calculations, COLA, WEP/GPO (SSFA), Healthcare (GIC), or "Tax Bomb".
- specific MSRB regulations (CMR 840) or recent legislative updates.

### 2. Image Generation
- Use the `generate_image` tool.
- **Style Prompt:** "A sleek, modern web design abstract background featuring a rich blue, indigo, and purple gradient. In the foreground, [specific concept elements like charts/coins/documents] in a glassmorphism style. High-end, professional financial dashboard aesthetic. 16:9 aspect ratio."

### 3. Drafting & Formatting
- Write the content using **HTML inside the TypeScript string**.
- Use `<h2>` for section headers.
- Use `<ul>` or `<ol>` for lists.
- **CRITICAL**: Always include an internal link to a relevant tool (`/ssfa-auditor`, `/tax-bomb`, `/calculator`) using the primary button class: `<a href="/url" class="btn btn-primary">CTA Text</a>`.

### 4. Publishing (The "Seed" Process)
Since the blog uses a database, you cannot just "edit a file" to add a post. You must script the insertion.

1.  **Prepare the Script**:
    - Copy the template from `.agent/skills/mass_pension_blog_writer/scripts/seed_post.ts`.
    - Fill in your new post data (ID, Title, Content, etc.).
    - Save it as a temporary script (e.g., `scripts/temp_seed.ts`).

2.  **Execute**:
    - Run `npx tsx scripts/temp_seed.ts`.
    - Verify with `npx tsx scripts/check-db.ts`.

3.  **Cleanup**:
    - Delete the temporary script.

## 📂 Resources & Scripts

- **`scripts/seed_post.ts`**: Template script for inserting/updating posts in the DB.
- **`scripts/delete_post.ts`**: Template script for removing posts by slug.

## ✅ Quality Checklist
- [ ] Is the tone authoritative?
- [ ] Is the math explained clearly?
- [ ] Is there a clear CTA to a calculator tool?
- [ ] Are HTML tags properly closed within the content string?
- [ ] Does the image follow the brand guidelines?
