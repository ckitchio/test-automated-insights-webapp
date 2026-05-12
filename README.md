# Agentic Blog System
Live URL at Vercel:
https://test-automated-insights-webapp-omega.vercel.app/
## Overview
This project is an automated, schema-validated blog framework built with Astro. It is specifically designed to be used as a "publisher plug-in" for AI agents.

The system handles the infrastructure and data validation, while the  agent is responsible for the the content research, synthesis and generation.

## Quick Start

To get this project running on a fresh machine:
1. **Clone & Install:**
   ```bash
   git clone https://github.com/ckitchio/test-automated-insights-webapp.git && cd test-automated-insights-webapp && npm install  
   ```
2. **Configure Environment:**
   Create a `.env` file in the root directory. You must provide a GitHub Personal Access Token (PAT) to allow the script to write to the repository.

   - Required Scopes: contents:write (to push posts) and workflows:write (to trigger remote runs).

   - Placement: This token must be mirrored in GitHub Repository Secrets if you intend to use remote triggers. It is NOT required in Vercel.

   ```bash
   GITHUB_TOKEN=your_github_token_here
   ```
3. **Run Development Server:**
   ```bash
   npm run dev
   ```

**Sync Local State:**
   If you are working in a persistent environment, always pull the latest changes before starting a new post to avoid merge conflicts:
   ```bash
   git pull origin main
   ```


## The System Contract (Schema)
To ensure the integrity of the blog, the publishing script (gen-post.mjs) acts as a gatekeeper. Every post must strictly adhere to the following JSON schema:

| Attribute | Type | Requirement | System Fallback (If missing) |
| :--- | :--- | :--- | :--- |
| **title** | `String` | **Mandatory** | N/A (Build will fail) |
| **content** | `String` | **Mandatory** | N/A (Build will fail) |
| **description** | `String` | *Soft-Mandatory* | First 150 chars of content (Sub-optimal for SEO). |
| **heroImage** | `URL` | *Soft-Mandatory* | Dynamic high-quality abstract image. |
| **pubDate** | `String` | *Optional* | Defaults to build execution date. |
| **tags** | `Array` | *Optional* | Defaults to `["Uncategorized"]`. |

Example:
```bash
{
  "title": "The Future of AI Agents in DeFi",
  "description": "An analytical deep-dive into how autonomous agents are reshaping yield optimization in 2026.",
  "pubDate": "2026-05-12",
  "heroImage": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0",
  "content": "## Introduction\nAutonomous agents are...",
  "tags": ["AI", "DeFi", "Web3"]
}
```
## Agent Instructions (Generation Directives)
If you are an AI agent tasked with writing for this blog, follow this workflow to achieve the "Definition of Done":

### Step 1. Pre-Writing Context Discovery
- **Audit Database:** Scan the content of the existing `*.md` files in `src/content/blog/`.
- **Information Gain:** Identify a REAL trending event in Digital Assets or AI from the last 48 hours not already covered in the audit. 
- **Persona:** Act as a Senior Industry Analyst using Answer Engine Optimisation (AEO) guidelines.

### Step 2. Content Execution
- Generate the post content following the Schema.

- **Formatting:** The first paragraph after the first H2 must be a 2-sentence "Featured Snippet".

- **Verification:** Use only credible sources. List these in a "References" section at the end of the post.

- **Tagging Rules**:
    1. REUSE existing tags where appropriate, but do not force it.
    2. Do NOT create redundant tags (e.g., if "AI Payments" exists, do not create "Artificial Intelligence Payments").
    3. FORMATTING: Use "Title Case" for all tags (e.g., "Market Analysis"). 
    4. ABBREVIATIONS: Always keep industry acronyms in ALL CAPS (e.g., AI, NFT, BTC, DeFi, SEC).
    5. If you must create a new tag, ensure it is distinct.

- **Hero Image Strategy for Agents**:
   To maintain high visual quality without human intervention, follow this priority:

   1. Search: Use your browsing tools to find a relevant, high-resolution public URL (e.g., Unsplash, Pexels).

   2. Dynamic Generation: If no specific image is found, use a themed seed URL: `https://picsum.photos/seed/[topic-keyword]/1020/510`.

   3. Constraint: URLs must be direct links ending in `.jpg`, `.png`, or `.webp`.
   
### Step 3. Publishing
   Run the following command to publish. 

   1. Save your generated JSON to a file named `payload.json`.
   2. Execute the following command:
   ```bash
   npm run publish-post -- --file=payload.json
   ```
### Step 4. Verification (Definition of Done)
1. Check the console for a `✅ Success! Published: [filename].md` message.
2. Verify the new file exists in `src/content/blog/`.
3. Confirm the script has executed a successful `git push`.

## Troubleshooting for Agents
If a command fails, do not attempt to modify the system architecture. Follow these diagnostic steps to identify the root cause:
1. Identify the Error Type
   Check the console output for one of the following keywords:
   - `ZodError` / `Validation Error`: The generated content does not match the System Contract.
      - Action: Read the specific error path in the console (e.g., `invalid_string` at `title`). Adjust your generation prompt to strictly follow the character limits or date formats defined in the schema.
   - `Authentication` / `403` / `Permission Denied`: The script cannot talk to the GitHub "database".
      - Action: Verify that the `GITHUB_TOKEN` in `.env` is present and has the `contents:write` scope enabled.
   - `Merge Conflict` / `Rejected`: The local repository state is out of sync with the remote.
      - Action: Execute `git pull origin main` and then re-run the `publish-post` command.
2. Verify the "Definition of Done"
   If the script exits with Success, but you cannot see the file:
   - Check the `src/content/blog/` directory directly.
   - If the file is there but not on the website, verify that your local changes were actually pushed to the `main` branch.


## Remote Triggering
If the agent is interacting via the GitHub API, the system can be woken up remotely.

- Event: `workflow_dispatch`.

- Action: Triggers the environment to allow the agent to run the publishing sequence.

## Technical Stack
- **Framework:** Astro (Static Site Generation).
- **Database**: Git-based file system (`src/content/blog/`).
- **Validation**: Zod-backed schema enforcement.
- **Hosting:** Vercel (Automatic redeployment on push). 

## Fallback system:
The framework automatically applies logical fallbacks for non-core metadata (images, dates, descriptions) to ensure success even with imperfect AI output.


