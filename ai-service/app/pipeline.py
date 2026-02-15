import requests
from bs4 import BeautifulSoup
from .nlp_utils import (
    compute_best_sentence,
    split_into_sentences,
    extract_numbers,
    extract_entities
)
from ddgs import DDGS

from .config import settings

print(f"[DEBUG] TIMEOUT: {settings.request_timeout}, MAX_RESULTS: {settings.max_search_results}")

DUCKDUCKGO_URL = "https://html.duckduckgo.com/html/"


# def search_duckduckgo(query: str):
#     headers = {"User-Agent": settings.user_agent}
#     response = requests.post(
#         DUCKDUCKGO_URL,
#         data={"q": query},
#         headers=headers,
#         timeout=settings.request_timeout
#     )
#     print(response.status_code)
#     print(response.text[:1000])  # first 1000 chars


#     soup = BeautifulSoup(response.text, "html.parser")
#     results = []

#     for link in soup.find_all("a", class_="result__a", limit=settings.max_search_results):
#         results.append({
#             "title": link.get_text(),
#             "url": link["href"]
#         })

#     return results

def search_duckduckgo(query: str):
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query):
                results.append({
                    "title": r.get("title", ""),
                    "url": r.get("href", "")
                })
                if len(results) >= settings.max_search_results:
                    break
    except Exception as e:
        print(f"[SEARCH ERROR] {e}")
    return results

def generate_search_queries(claim: str):
    return [
        claim,
        f"{claim} fact check",
        f"{claim} false",
        f"{claim} true",
        f"{claim} news"
    ]


def fetch_article_text(url: str):
    try:
        headers = {"User-Agent": settings.user_agent}
        response = requests.get(url, headers=headers, timeout=settings.request_timeout)
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

        # max_similarity = 0
        # best_sentence = ""

        # for sentence in sentences:
        #     sim = compute_similarity(claim, sentence)
        #     if sim > max_similarity:
        #         max_similarity = sim
        #         best_sentence = sentence

        # similarity = max_similarity
        best_sentence, similarity = compute_best_sentence(claim, sentences)


        # if similarity >= SIMILARITY_THRESHOLD_SUPPORT:
        #     stance = "support"
        #     support_count += 1
        # else:
        #     stance = "neutral"

        claim_numbers = extract_numbers(claim)
        sentence_numbers = extract_numbers(best_sentence)

        # if claim_numbers and sentence_numbers:
        #     if claim_numbers != sentence_numbers:
        #         stance = "contradict"
        #     else:
        #         stance = "support"
        # elif similarity >= SIMILARITY_THRESHOLD_SUPPORT:
        #     stance = "support"
        # else:
        #     stance = "neutral"

        claim_numbers = extract_numbers(claim)
        sentence_numbers = extract_numbers(best_sentence)

        claim_entities = extract_entities(claim)
        sentence_entities = extract_entities(best_sentence)

        if claim_numbers and sentence_numbers:
            if claim_numbers != sentence_numbers:
                stance = "contradict"
                contradict_count += 1
            else:
                stance = "support"
                support_count += 1

        elif claim_entities["DATE"] and sentence_entities["DATE"]:
            if claim_entities["DATE"] != sentence_entities["DATE"]:
                stance = "contradict"
                contradict_count += 1
            else:
                stance = "support"
                support_count += 1

        elif similarity >= 0.8:
            stance = "support"
            support_count += 1

        elif similarity >= 0.65:
            stance = "neutral"

        else:
            stance = "neutral"


        sources.append({
            "title": result["title"],
            "url": result["url"],
            "stance": stance,
            "similarity_score": round(similarity, 3)
        })

    return sources, support_count, contradict_count


def decide_verdict(support_count: int, contradict_count: int):

    if contradict_count > support_count:
        return "Likely False", 0.85

    if support_count > contradict_count:
        return "Likely True", 0.85

    if support_count == 1:
        return "Unverified", 0.6

    return "Unverified", 0.5



def run_verification_pipeline(claim: str):
    # enhanced_query = f"{claim} fact check OR false OR true OR news"
    # search_results = search_duckduckgo(enhanced_query)
    
    queries = generate_search_queries(claim)

    all_results = []
    for q in queries:
        all_results.extend(search_duckduckgo(q))

    search_results = list({r["url"]: r for r in all_results}.values())

    sources, support_count, contradict_count = analyze_evidence(
        claim,
        search_results
    )

    # verdict, confidence = decide_verdict(support_count)
    verdict, confidence = decide_verdict(support_count, contradict_count)

    return {
        "verdict": verdict,
        "confidence": confidence,
        "analysis_summary": f"{support_count} sources show strong similarity to the claim.",
        "sources": sources
    }
