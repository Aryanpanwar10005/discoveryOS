import fitz

def extract(path):
    doc = fitz.open(path)

    text = ""

    for page in doc:
        text += page.get_text()

    doc.close()

    return text