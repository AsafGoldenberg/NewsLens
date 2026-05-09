import httpx
from bs4 import BeautifulSoup

async def scrape_article(url: str) -> dict:
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        response = await client.get(
            url,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
        tag.decompose()

    title_tag = soup.find("h1") or soup.find("title")
    title = title_tag.get_text(" ", strip=True) if title_tag else None

    paragraphs = [
        p.get_text(" ", strip=True)
        for p in soup.find_all("p")
    ]

    article_text = "\n\n".join(
        p for p in paragraphs
        if len(p.split()) > 8
    )

    return {
        "title": title,
        "text": article_text[:12000]
    }