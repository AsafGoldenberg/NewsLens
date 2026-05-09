import { useMemo, useState } from "react";
import "./App.css";
import { analyzeArticle } from "./api";
import type { AnalysisResult, FlaggedTerm } from "./types";

const EXAMPLE_ARTICLE = `The government announced a new education policy today, saying it would improve access to schools and reduce inequality between wealthy and poor communities. Supporters of the policy argue that it will provide more funding to under-resourced schools and help students from disadvantaged backgrounds. Critics, however, say the plan is expensive, rushed, and lacks clear evidence that it will improve student outcomes.

The article quotes several government officials and one opposition lawmaker, but it does not include comments from teachers, parents, or independent education researchers. The headline describes the policy as a dramatic overhaul, while the body of the article presents a more cautious and mixed picture. Education experts have previously warned that large reforms can fail when implementation details are unclear, though some researchers say targeted funding can improve long-term outcomes when paired with teacher training and accountability measures.`;

function leanLabel(score: number): string {
  if (score <= -3) return "Left";
  if (score < 0) return "Center-Left";
  if (score === 0) return "Center";
  if (score <= 3) return "Center-Right";
  return "Right";
}

function getSliderPosition(score: number): number {
  // Converts -4..4 into 0..100
  return ((score + 4) / 8) * 100;
}

function highlightFlaggedTerms(article: string, terms: FlaggedTerm[]) {
  if (!article || terms.length === 0) {
    return article;
  }

  const uniqueTerms = Array.from(
    new Set(
      terms
        .map((item) => item.term.trim())
        .filter((term) => term.length > 1)
    )
  );

  if (uniqueTerms.length === 0) {
    return article;
  }

  const escapedTerms = uniqueTerms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  const regex = new RegExp(`(${escapedTerms.join("|")})`, "gi");
  const parts = article.split(regex);

  return parts.map((part, index) => {
    const isFlagged = uniqueTerms.some(
      (term) => term.toLowerCase() === part.toLowerCase()
    );

    if (!isFlagged) {
      return part;
    }

    return (
      <mark key={`${part}-${index}`} className="highlight">
        {part}
      </mark>
    );
  });
}

function App() {
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzedText, setAnalyzedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const sliderPosition = useMemo(() => {
    if (!analysis) return 50;
    return getSliderPosition(analysis.political_lean_score);
  }, [analysis]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setAnalysis(null);

    if (!content.trim()) {
      setErrorMessage("Please enter an article URL or paste article text.");
      return;
    }

    try {
      setIsLoading(true);
      const result = await analyzeArticle(inputType, content);
      setAnalysis(result);

      if (inputType === "text") {
        setAnalyzedText(content);
      } else {
        setAnalyzedText("");
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function useExampleArticle() {
    setInputType("text");
    setContent(EXAMPLE_ARTICLE);
    setAnalysis(null);
    setErrorMessage("");
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">NewsLens</p>
        <h1>Media Framing Analyzer</h1>
        <p className="subtitle">
          Analyze article framing, emotional language, missing context, and
          headline-body consistency using a FastAPI + LLM backend.
        </p>
      </section>

      <section className="panel">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-header">
            <div>
              <h2>Analyze an article</h2>
              <p>Paste raw article text or enter a URL.</p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={useExampleArticle}
            >
              Use example
            </button>
          </div>

          <div className="toggle">
            <button
              type="button"
              className={inputType === "text" ? "active" : ""}
              onClick={() => setInputType("text")}
            >
              Raw text
            </button>

            <button
              type="button"
              className={inputType === "url" ? "active" : ""}
              onClick={() => setInputType("url")}
            >
              URL
            </button>
          </div>

          {inputType === "text" ? (
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Paste article text here..."
              rows={10}
            />
          ) : (
            <input
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="https://example.com/news/article"
            />
          )}

          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Analyze article"}
          </button>

          {errorMessage && <div className="error-box">{errorMessage}</div>}
        </form>
      </section>

      {isLoading && (
        <section className="panel loading-panel">
          <div className="loader" />
          <p>Analyzing framing signals...</p>
        </section>
      )}

      {analysis && (
        <section className="results">
          <div className="results-header">
            <div>
              <p className="eyebrow">Analysis result</p>
              <h2>{analysis.title || "Untitled article"}</h2>
            </div>
          </div>

          <div className="grid two-columns">
            <article className="card">
              <h3>Political lean</h3>
              <div className="lean-slider">
                <div className="slider-track">
                  <div
                    className="slider-marker"
                    style={{ left: `${sliderPosition}%` }}
                  />
                </div>

                <div className="slider-labels">
                  <span>Left</span>
                  <span>Center</span>
                  <span>Right</span>
                </div>
              </div>

              <p className="big-value">{analysis.political_lean}</p>
              <p className="muted">
                Score: {analysis.political_lean_score} / 4{" "}
                <span>({leanLabel(analysis.political_lean_score)})</span>
              </p>
            </article>

            <article className="card">
              <h3>Emotional language</h3>
              <p className="score">
                {analysis.emotional_language_score}
                <span>/10</span>
              </p>
              <div className="score-bar">
                <div
                  style={{
                    width: `${analysis.emotional_language_score * 10}%`,
                  }}
                />
              </div>
              <p className="muted">
                Higher scores indicate more emotionally charged wording.
              </p>
            </article>
          </div>

          <div className="grid">
            <article className="card">
              <h3>Neutral summary</h3>
              <p>{analysis.summary}</p>
            </article>

            <article className="card">
              <h3>Flagged terms</h3>
              {analysis.flagged_terms.length > 0 ? (
                <div className="terms-list">
                  {analysis.flagged_terms.map((item, index) => (
                    <div className="term-row" key={`${item.term}-${index}`}>
                      <div>
                        <strong>{item.term}</strong>
                        <p>{item.reason}</p>
                      </div>
                      <span>{item.intensity}/10</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">No strongly emotional terms flagged.</p>
              )}
            </article>

            <article className="card">
              <h3>Framing analysis</h3>

              <h4>Quoted sources</h4>
              <ul>
                {analysis.framing_analysis.quoted_sources.map((source) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>

              <h4>Centered perspective</h4>
              <p>{analysis.framing_analysis.centered_perspective}</p>

              <h4>Missing perspectives</h4>
              <ul>
                {analysis.framing_analysis.missing_perspectives.map(
                  (perspective) => (
                    <li key={perspective}>{perspective}</li>
                  )
                )}
              </ul>
            </article>

            <article className="card">
              <h3>Missing context</h3>
              <ul>
                {analysis.missing_context.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="card">
              <h3>Headline vs. body consistency</h3>
              <p className="score">
                {analysis.headline_body_consistency.score}
                <span>/10</span>
              </p>
              <p>{analysis.headline_body_consistency.explanation}</p>
            </article>

            <article className="card caveat">
              <h3>Important caveat</h3>
              <p>{analysis.caveat}</p>
            </article>
          </div>

          {analyzedText && (
            <article className="card article-preview">
              <h3>Article text with flagged terms</h3>
              <p>{highlightFlaggedTerms(analyzedText, analysis.flagged_terms)}</p>
            </article>
          )}
        </section>
      )}
    </main>
  );
}

export default App;