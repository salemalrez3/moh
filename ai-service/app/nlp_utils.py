import spacy, re

nlp = spacy.load("en_core_web_sm")


def preprocess_text(text: str):
    doc = nlp(text)
    return doc


def compute_similarity(text1: str, text2: str) -> float:
    doc1 = nlp(text1)
    doc2 = nlp(text2)
    return doc1.similarity(doc2)

def split_into_sentences(text: str):
    doc = nlp(text)
    return [sent.text.strip() for sent in doc.sents]

def extract_numbers(text: str):
    return re.findall(r"\d+", text)