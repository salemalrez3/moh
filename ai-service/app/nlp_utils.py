import spacy
import re
from sentence_transformers import SentenceTransformer, util

nlp = spacy.load("en_core_web_sm")

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def split_into_sentences(text: str):
    doc = nlp(text)
    return [sent.text.strip() for sent in doc.sents]


def compute_best_sentence(claim: str, sentences: list[str]):
    if not sentences:
        return "", 0.0

    claim_embedding = embedding_model.encode(claim, convert_to_tensor=True)
    sentence_embeddings = embedding_model.encode(sentences, convert_to_tensor=True)

    similarities = util.cos_sim(claim_embedding, sentence_embeddings)[0]

    max_index = int(similarities.argmax())
    max_score = float(similarities[max_index])

    return sentences[max_index], max_score

def extract_numbers(text: str):
    return re.findall(r"\d+", text)

def extract_entities(text: str):
    doc = nlp(text)

    entities = {
        "DATE": [],
        "ORG": [],
        "GPE": [],
        "PERSON": []
    }

    for ent in doc.ents:
        if ent.label_ in entities:
            entities[ent.label_].append(ent.text)

    return entities
