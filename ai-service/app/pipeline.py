import requests
from bs4 import BeautifulSoup
from .nlp_utils import compute_similarity, split_into_sentences, extract_numbers
from .config import (
    MAX_SEARCH_RESULTS,
    SIMILARITY_THRESHOLD_SUPPORT,
    USER_AGENT,
    REQUEST_TIMEOUT
)

DUCKDUCKGO_URL = "https://html.duckduckgo.com/html/"


def search_duckduckgo(query: str):
    headers = {"User-Agent": USER_AGENT}
    response = requests.post(
        DUCKDUCKGO_URL,
        data={"q": query},
        headers=headers,
        timeout=REQUEST_TIMEOUT
    )

    soup = BeautifulSoup(response.text, "html.parser")
    results = []

    for link in soup.find_all("a", class_="result__a", limit=MAX_SEARCH_RESULTS):
        results.append({
            "title": link.get_text(),
            "url": link["href"]
        })

    return results


def fetch_article_text(url: str):
    try:
        headers = {"User-Agent": USER_AGENT}
        response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
        soup = BeautifulSoup(response.text, "html.parser")

        paragraphs = soup.find_all("p")
        text = " ".join(p.get_text() for p in paragraphs[:5])
        return text
    except:
        return ""


def analyze_evidence(claim: str, search_results):
    sources = []
    support_count = 0
    contradict_count = 0

    for result in search_results:
        article_text = fetch_article_text(result["url"])
        if not article_text:
            continue

        sentences = split_into_sentences(article_text)

        max_similarity = 0
        best_sentence = ""

        for sentence in sentences:
            sim = compute_similarity(claim, sentence)
            if sim > max_similarity:
                max_similarity = sim
                best_sentence = sentence

        similarity = max_similarity


        # if similarity >= SIMILARITY_THRESHOLD_SUPPORT:
        #     stance = "support"
        #     support_count += 1
        # else:
        #     stance = "neutral"

        claim_numbers = extract_numbers(claim)
        sentence_numbers = extract_numbers(best_sentence)

        if claim_numbers and sentence_numbers:
            if claim_numbers != sentence_numbers:
                stance = "contradict"
            else:
                stance = "support"
        elif similarity >= SIMILARITY_THRESHOLD_SUPPORT:
            stance = "support"
        else:
            stance = "neutral"

        sources.append({
            "title": result["title"],
            "url": result["url"],
            "stance": stance,
            "similarity_score": round(similarity, 3)
        })

    return sources, support_count, contradict_count


def decide_verdict(support_count: int):
    if support_count >= 2:
        return "Likely True", 0.8
    elif support_count == 1:
        return "Unverified", 0.6
    else:
        return "Unverified", 0.5


def run_verification_pipeline(claim: str):
    enhanced_query = f"{claim} fact check OR false OR true OR news"
    search_results = search_duckduckgo(enhanced_query)

    sources, support_count, contradict_count = analyze_evidence(
        claim,
        search_results
    )

    verdict, confidence = decide_verdict(support_count)

    return {
        "verdict": verdict,
        "confidence": confidence,
        "analysis_summary": f"{support_count} sources show strong similarity to the claim.",
        "sources": sources
    }
