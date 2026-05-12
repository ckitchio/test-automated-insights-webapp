import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { z } from 'zod';
import { execSync } from 'child_process';

// 1. Define the System Contract (Schema)
const PostSchema = z.object({
  title: z.string().max(60, "Title must be under 60 characters"),
  description: z.string().min(10, "Description is too short").max(160, "Description must be under 160 characters").optional(),
  pubDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
  content: z.string().min(10, "Content is too short"),
  tags: z.array(z.string()).min(1).max(3).optional(),
  heroImage: z.string().optional()
});

// Helper to create URL-friendly filenames
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
}

async function run() {
  const args = process.argv.slice(2);
  const fileArg = args.find(arg => arg.startsWith('--file='));
  
  if (!fileArg) {
    console.error("❌ Error: Missing --file argument.");
    process.exit(1);
  }

  const filePath = fileArg.split('=')[1];
  
  try {
    // 2. Read and Parse Payload
    const rawData = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
    const payload = JSON.parse(rawData);

    // 3. Validate against Schema
    const validatedData = PostSchema.parse(payload);

    // Fallbacks for missing optional fields (with console warnings)
    const appliedFallbacks = [];

    const finalData = { ...validatedData };

    if (!finalData.description) {
      finalData.description = validatedData.content.split('\n')[0].slice(0, 150) + "...";
      appliedFallbacks.push("description");
    }

    if (!finalData.pubDate) {
      finalData.pubDate = new Date().toISOString().split('T')[0];
      appliedFallbacks.push("pubDate");
    }

    if (!finalData.tags || finalData.tags.length === 0) {
      finalData.tags = ["Uncategorized"];
      appliedFallbacks.push("tags");
    }

    if (!finalData.heroImage) {
      finalData.heroImage = `https://picsum.photos/seed/${validatedData.title.length}/1020/510`;
      appliedFallbacks.push("heroImage");
    }

    // Log any fallbacks applied
    if (appliedFallbacks.length > 0) {
      console.log(`⚠️ Data processed with fallbacks for: [${appliedFallbacks.join(", ")}]`);
    } else {
      console.log("✅ Data validated: Agent provided perfect information.");
    }
    
    // 4. Format for Astro (Markdown + Frontmatter)
    const { content, ...frontmatter } = finalData;
    const fileContent = matter.stringify(content, frontmatter);
    
    const slug = `${finalData.pubDate}-${slugify(finalData.title)}`;
    const outputDir = path.join(process.cwd(), 'src', 'content', 'blog');
    const outputFileName = `${slug}.md`;
    const outputPath = path.join(outputDir, outputFileName);

    // 5. Write to "Database"
    fs.writeFileSync(outputPath, fileContent);
    console.log(`✅ Success! Published locally: ${outputFileName}`);

    // 6. Git Automation (Remote Sync)
    // Only attempt push if GITHUB_TOKEN is found (local dev) or if running in CI
    if (process.env.GITHUB_TOKEN || process.env.NODE_ENV === 'production') {
      console.log("🚀 Starting Git push...");
      execSync(`git add ${outputPath}`);
      execSync(`git commit -m "🤖 Agent Update: ${finalData.title}"`);
      execSync(`git push origin main`);
      console.log("🌐 Database synced with GitHub.");
    } else {
      console.warn("⚠️ GITHUB_TOKEN not found. Skipping push (local mode).");
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Validation Error:", JSON.stringify(z.treeifyError(error), null, 2));
    } else if (error.code === 'ENOENT') {
      console.error(`❌ File Error: Could not find payload file at ${filePath}`);
    } else {
      console.error("❌ System Error:", error.message);
    }
    process.exit(1);
  }
}

run();