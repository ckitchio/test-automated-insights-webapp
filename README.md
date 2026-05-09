# Agentic Blog System
Live URL at Vercel:
https://test-automated-insights-webapp-omega.vercel.app/
## Overview
This project is an automated, AI-driven blog system built for extreme autonomy. It is designed to be **agent-ready**, allowing an AI agent (such as Claude or Cursor) to clone, install, and execute the full content generation lifecycle with zero human intervention.
The system focuses on functional utility over aesthetic design, using **Astro** for rapid content routing and the **Vercel AI SDK** for intelligent automation.
Pages in this blog system include the three required pages: Post List, Post Detail, and Tag-filtered pages.
Automation is handled via GitHub Actions (see `.github/workflows`).
## 🚀 Quick Start

To get this project running on a fresh machine:
1. **Clone & Install:**
   ```bash
   git clone https://github.com/ckitchio/test-automated-insights-webapp.git && cd test-automated-insights-webapp && npm install  
   ```
2. **Configure Secrets:**
Copy the example environment file and populate it with your provider details.
   ```bash
   cp .env.example .env
   # Edit .env to include your AI_PROVIDER, AI_API_KEY, and AI_MODEL_ID. 
   ```
3. **Run:**
   ```bash
   npm run dev # To see the blog
   npm run gen-post # To generate your first post
   ```
## Setup & Environment
To ensure the "Find & Publish" script functions correctly, you must configure the following keys. These are provider-agnostic; for now the system supports OpenRouter, OpenAI, Anthropic, and Mistral:

| **Variable**  | **Description**                                 | **Requirement**          |
| ------------- | ----------------------------------------------- | ------------------------------ |
| `AI_PROVIDER` | The service you are using (e.g., `openrouter`, `openai`, `anthropic`)                      | Mandatory                   |
| `AI_API_KEY`  | Your secret API key from the chosen provider             | Mandatory                 |
| `AI_MODEL_ID` | The specific model ID (e.g., `openrouter/free`, `gpt-4o`)          | Mandatory              |
| `AI_BASE_URL` | The API endpoint (Optional if using standard providers) | Optional |

## Automation Logic
The system is designed for total autonomy:

### 1. The Content Engine (`gen-post.mjs`)
The `npm run gen-post` command executes a script that:
- **Analyses** existing blog posts to avoid duplication.
- **Identifies** a trending topic in Digital Assets or AI from the last 48 hours.
- **Generates** a high-quality blog post **optimised** for Answer Engine Optimisation (AEO).
- **Saves** the post as a Markdown file in `src/content/blog/`.

### 2. Scheduled Updates (GitHub Actions)
The system is optimised for continuous delivery via GitHub Actions (see `.github/workflows/publish-post.yml`).

Frequency: Scheduled to run daily at 01:00 UTC (09:00 CST/Macau time).

Manual Trigger: Developers or agents can trigger an immediate generation via the Actions tab using the `workflow_dispatch` event.

Execution: The action executes `gen-post.mjs`, commits the new Markdown file to the repository, and pushes the change.

Deployment: Vercel automatically detects the new commit and redeploys the live site.

## Instructions for AI Agents
To automate this system on a fresh deployment:

1. Repository Secrets: Navigate to `Settings > Secrets and variables > Actions` and inject the mandatory variables from the Setup & Environment table.

2. Workflow Permissions: Ensure the `GITHUB_TOKEN` is set to "Read and write permissions" under `Settings > Actions > General` to allow the agent to commit and push new content.

4. Manual Execution: If immediate content is required, the agent should locate the `Scheduled Post Generation` workflow and execute `workflow_dispatch`.



## Technical Stack
- **Framework:** Astro (Static Site Generation).
- **AI Integration:** Vercel AI SDK with OpenRouter.
- **Content:** Markdown-based file system with `gray-matter` for frontmatter parsing.
- **Hosting:** Vercel.




