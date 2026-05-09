import 'dotenv/config';
import { generateText } from 'ai';
import { google, createGoogleGenerativeAI } from '@ai-sdk/google';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const AI_PROVIDER = process.env.AI_PROVIDER?.toLowerCase() || 'openrouter';
const AI_API_KEY = process.env.AI_API_KEY;
const AI_BASE_URL = process.env.AI_BASE_URL;
const MODEL_ID = process.env.AI_MODEL_ID || 'gemini-3.1-flash-lite';

/**
 * Setup the AI Provider and return a Model Instance
 * In Vercel AI SDK, the model instance is what generateText needs.
 */
function getAiModel() {
  if (!AI_API_KEY) {
    throw new Error('Missing AI_API_KEY. Set AI_PROVIDER and AI_API_KEY in .env.');
  }

  switch (AI_PROVIDER) {
    case 'openai':
      // Standard OpenAI driver
      return openai(MODEL_ID);
    
    case 'mistral':
      // Mistral provider setup for 2026
      const mistralProvider = createMistral({
        apiKey: AI_API_KEY,
      });
      return mistralProvider(MODEL_ID);

    case 'openrouter':
      // Custom OpenAI driver for OpenRouter
      const openrouter = createOpenAI({
        apiKey: AI_API_KEY,
        baseURL: AI_BASE_URL || 'https://openrouter.ai/api/v1',
      });
      return openrouter(MODEL_ID);

    case 'google':
      // Google Gemini driver
      const googleProvider = createGoogleGenerativeAI({
    apiKey: AI_API_KEY,
  });
  return googleProvider(MODEL_ID);

    case 'anthropic':
      // Anthropic Claude driver
      return anthropic(MODEL_ID);
    
    default:
      throw new Error(`Unsupported AI_PROVIDER: ${AI_PROVIDER}`);
  }
}

async function getExistingContext() {
    const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
    if (!fs.existsSync(blogDir)) return { titles: "", tags: "" };

    const files = fs.readdirSync(blogDir);
    let existingTitles = [];
    let existingTags = new Set();

    files.forEach(file => {
        if (file.endsWith('.md')) {
            try {
                const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
                const { data } = matter(content);
                if (data.title) existingTitles.push(data.title);
                if (data.tags) data.tags.forEach(tag => existingTags.add(tag.toLowerCase()));
            } catch (e) {
                console.warn(`⚠️ Skipping broken file: ${file}`);
            }
        }
    });

    return {
        titles: existingTitles.join(', '),
        tags: Array.from(existingTags).join(', ')
    };
}

async function publishPost() {
  console.log(`🤖 Agent: Starting synthesis using ${AI_PROVIDER} (${MODEL_ID})...`);
  const context = await getExistingContext();
    console.log("🧠 Memory: Recalling previous posts to avoid duplication...");

  const prompt = `
    ### MISSION
    Act as a Senior Industry Analyst specializing in Digital Assets (Web3/Crypto) and AI Innovation. 
    Your goal is to produce a data-driven, AEO-optimized blog post based on a REAL trending event from the last 48 hours.
    
    ### CRITICAL CONSTRAINT: 
    Do NOT write about these specific stories/titles again: [${context.titles}]
    Ensure high "Information Gain"—if a topic is similar, find a completely new angle or update.

    ### TAGGING RULES:
    1. Check these existing tags: [${context.tags}]
    2. REUSE existing tags where appropriate, but do not force it.
    3. Do NOT create redundant tags (e.g., if "AI Payments" exists, do not create "Artificial Intelligence Payments").
    4. FORMATTING: Use "Title Case" for all tags (e.g., "Market Analysis"). 
    5. ABBREVIATIONS: Always keep industry acronyms in ALL CAPS (e.g., AI, NFT, BTC, DeFi, SEC).
    6. If you must create a new tag, ensure it is distinct.

    ### RESEARCH REQUIREMENTS
    1. **Identify a Trending Topic:** Research the latest significant news in Digital Assets or AI.
    2. **Fact-Check:** Use only credible sources (e.g., Reuters, TechCrunch, Coindesk, Decrypt, OpenAI Press, etc.).
    3. **No Hallucinations:** You MUST NOT invent data. If a specific figure is unknown, omit it or use "Industry estimates suggest...".

    ### OUTPUT RULES
    - **AEO Lead:** The first paragraph after the H2 heading must be a 2-sentence "Featured Snippet" that answers the question directly.
    - **Tagging:** Provide at least 1 and NO MORE THAN 3 tags. Tags should be high-level (e.g., "Layer 2", "Generative AI", "Regulation").
    - **Real References:** The reference section must list the ACTUAL name of the publication and the URL used for the research.
    - **Response:** Do not include any additional text beyond the specified sections in your response. Your response MUST be in strict Markdown format as outlined below, with no deviations. Adhere EXACTLY to the structure and formatting rules provided. It must always starts with the frontmatter (---) and end with the references section. Failure to comply with the formatting rules will result in a failed output.

    ### FORMATTING (Strict Markdown; Ensure a NEWLINE after the first set of dashes)
    ---
    title: [Punchy, SEO-optimized Title < 60 chars]
    description: [Professional 150 char meta-summary focusing on the "Why"]
    pubDate: ${new Date().toISOString().split('T')[0]}
    heroImage: 'https://picsum.photos/seed/${Math.random()}/720/360'
    tags: ["Tag1", "Tag2"]
    ---

    ## [A Compelling, Narrative H2 Heading]
    
    [A 2-sentence "Featured Snippet" that defines the core event and its immediate relevance. Use **bold** for primary entities.]
    
    ## [A Thematic H2 regarding Market Impact or Technical Innovation]
    [Provide a deep-dive analysis. Use bullet points or a short "Key Stat" block to break up text. Ensure at least one specific numerical data point or technical milestone is included.]
    
    ## [A Final H2 regarding Strategic Outlook]
    [Synthesis of the 12-month outlook. Avoid clichés; provide a "So What?" factor for sophisticated readers.]
    
    ---
    ### References
    *   [Source Name 1](Source URL)
    *   [Source Name 2](Source URL)
    `;

  try {
    const modelInstance = getAiModel();

    const { text } = await generateText({
      model: modelInstance, // We pass the instance created in getAiModel
      prompt: prompt,
    });

    if (!text) throw new Error('AI provider returned no text.');

    // Clean up the text: AI sometimes wraps Markdown in backticks (```markdown)
    const cleanedText = text.replace(/^```markdown\n|```$/g, '').trim();

    // Function to quote all YAML values in the frontmatter (handles strings with colons, etc.)
    function quoteYamlValues(frontmatterText) {
      return frontmatterText.replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*):\s*(.+)$/gm, (match, indent, key, value) => {
        // Skip arrays (tags) and already-quoted values
        if (value.startsWith('[') || value.startsWith('"') || value.startsWith("'")) {
          return match;
        }
        // Quote the value
        const quotedValue = `"${value.replace(/(["\\])/g, '\\$1')}"`;
        return `${indent}${key}: ${quotedValue}`;
      });
    }
    
    // Declare normalizedText outside the if-else to fix scoping
    let normalizedText;

    // Apply quoting to the frontmatter part only
    const frontmatterEndIndex = cleanedText.indexOf('\n---\n', cleanedText.indexOf('---') + 3);
    if (frontmatterEndIndex !== -1) {
      const frontmatter = cleanedText.substring(0, frontmatterEndIndex + 5); // Include the closing ---
      const body = cleanedText.substring(frontmatterEndIndex + 5);
      const quotedFrontmatter = quoteYamlValues(frontmatter);
      normalizedText = quotedFrontmatter + body;
    } else {
      // Fallback if no second --- found
      normalizedText = quoteYamlValues(cleanedText);
    }

    const parsed = matter(normalizedText);
    const safeText = matter.stringify(parsed.content, parsed.data);

    const slug = `${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).slice(2, 10)}`;
    const filePath = path.join(process.cwd(), 'src', 'content', 'blog', `${slug}.md`);

    fs.writeFileSync(filePath, safeText);

    console.log(`✅ Success! Published: ${slug}.md`);

  } catch (error) {
    console.error('❌ AI Error:', error.message);
    console.log("⚠️ Falling back to Mock Mode for local demonstration...");

    const mockData = `---\ntitle: The Evolution of Institutional AI Assets\ndescription: How 2026 saw the merging of sovereign wealth and neural networks.\npubDate: ${new Date().toISOString().split('T')[0]}\nheroImage: 'https://picsum.photos/seed/mock/720/360'\ntags: ["AI", "Fintech"]\n---\n# How are institutions adopting AI assets?\n\nInstitutional players are shifting from experimentation to core integration.\n\n## Market Impact\nCapital flows are increasing.\n\n## Future Outlook\nExpect total automation by 2027.`;

    const mockSlug = `mock-${Date.now()}`;
    fs.writeFileSync(path.join(process.cwd(), 'src', 'content', 'blog', `${mockSlug}.md`), mockData);
    console.log(`✅ Mock published: ${mockSlug}.md`);
  }
}

publishPost();