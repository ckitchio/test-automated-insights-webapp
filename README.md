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
   git clone <repo-url> && cd <repo-dir> && npm install  
   ```
2. **Configure Secrets:**
Copy the example file and **add your `AI_API_KEY`**:
   ```bash
   cp .env.example .env
   # Open .env and add your OpenRouter key now.  
   ```
3. **Run:**
   ```bash
   npm run dev # To see the blog
   npm run gen-post # To generate your first post
   ```
## Setup & Environment
To ensure the "Find & Publish" script functions correctly, you must configure the following keys in your `.env` file:

| **Variable**  | **Description**                                 | **Default / Example**          |
| ------------- | ----------------------------------------------- | ------------------------------ |
| `AI_PROVIDER` | The model gateway provider                      | `openrouter`                   |
| `AI_API_KEY`  | Your OpenRouter or Provider API key             | `sk-or-v1-...`                 |
| `AI_MODEL_ID` | The specific model used for generation          | `openrouter/free`              |
| `AI_BASE_URL` | **(Optional)** API Endpoint if using OpenRouter | `https://openrouter.ai/api/v1` |
## Automation Logic
The system is designed for total autonomy:
### 1. The Content Engine (`gen-post.mjs`)
The `npm run gen-post` command executes a script that:
- **Analyses** existing blog posts to avoid duplication.
- **Identifies** a trending topic in Digital Assets or AI from the last 48 hours.
- **Generates** a high-quality blog post **optimised** for British English and Answer Engine Optimisation (AEO).
- **Saves** the post as a Markdown file in `src/content/blog/`.
### 2. Scheduled Updates (Vercel Cron)
The script is configured to run automatically via **Vercel Crons**. This ensures the blog remains updated daily without manual input.

## Technical Stack
- **Framework:** Astro (Static Site Generation).
- **AI Integration:** Vercel AI SDK with OpenRouter.
- **Content:** Markdown-based file system with `gray-matter` for frontmatter parsing.
- **Hosting:** Vercel.




