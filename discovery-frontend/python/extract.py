import json
import os
import sys

from pdf import extract as pdf_extract
from docx_extract import extract as docx_extract
from txt_extract import extract as txt_extract
from csv_extract import extract as csv_extract


file_path = sys.argv[1]

ext = os.path.splitext(file_path)[1].lower()

if ext == ".pdf":
    text = pdf_extract(file_path)

elif ext == ".docx":
    text = docx_extract(file_path)

elif ext == ".txt":
    text = txt_extract(file_path)

elif ext == ".csv":
    text = csv_extract(file_path)

else:
    print(json.dumps({
        "success": False,
        "error": "Unsupported file"
    }))
    sys.exit(0)


print(json.dumps({
    "success": True,
    "text": text
}))