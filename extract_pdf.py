import sys

try:
    import pypdf
    reader = pypdf.PdfReader('c:/Project/nael/catalog.pdf')
    for page in reader.pages:
        print(page.extract_text())
    sys.exit(0)
except ImportError:
    pass

try:
    import PyPDF2
    reader = PyPDF2.PdfReader('c:/Project/nael/catalog.pdf')
    for page in reader.pages:
        print(page.extract_text())
    sys.exit(0)
except ImportError:
    pass

try:
    import fitz
    doc = fitz.open('c:/Project/nael/catalog.pdf')
    for page in doc:
        print(page.get_text())
    sys.exit(0)
except ImportError:
    print("NO_PDF_LIB")
    sys.exit(1)
