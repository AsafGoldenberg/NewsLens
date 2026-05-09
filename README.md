# NewsLens — Media Framing Analyzer

NewsLens is a full-stack web application that analyzes how news articles frame political and social issues. Users can paste raw article text or submit a news article URL, and the app returns a structured dashboard with political-lean signals, emotional-language scoring, flagged wording, missing context, and headline/body consistency.

The goal of this project is not to determine objective truth or label an article as “biased” with certainty. Instead, NewsLens provides an AI-assisted reading aid that highlights framing patterns and helps users think more critically about media coverage.

---

## Features

- Analyze raw article text or a news article URL
- Extract article text from URLs using backend scraping
- Generate structured AI analysis using the OpenAI API
- Display political-lean signals on a left-to-right spectrum
- Score emotional language from 0–10
- Flag emotionally charged words and phrases
- Analyze framing:
  - Who is quoted
  - Whose perspective is centered
  - Which perspectives may be missing
- Identify missing context that a more balanced article might include
- Compare headline tone against the body of the article
- Show results in a clean React dashboard
- Highlight flagged terms inside pasted article text

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn
- httpx
- BeautifulSoup

### AI

- OpenAI API
- Structured JSON output using Pydantic models

---

## Project Architecture

```text
User
  ↓
React + TypeScript frontend
  ↓
FastAPI backend
  ↓
Article scraper / raw text handler
  ↓
OpenAI API analysis
  ↓
Structured JSON response
  ↓
Interactive results dashboard
