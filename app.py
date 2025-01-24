from flask import Flask, request, render_template, send_file
from anonymizer import Anonymizer, Preset
import io
from PyPDF2 import PdfReader, PdfWriter
from docx import Document

app = Flask(__name__)

# Rota principal para renderizar a interface
@app.route('/')
def index():
    return render_template('index.html')

# Rota para processar arquivos
@app.route('/process', methods=['POST'])
def process_file():
    if 'file' not in request.files:
        return "No file uploaded", 400

    uploaded_file = request.files['file']
    filename = uploaded_file.filename

    # Processar PDFs
    if filename.endswith('.pdf'):
        pdf_reader = PdfReader(uploaded_file)
        pdf_writer = PdfWriter()
        anonymizer = Anonymizer(preset=Preset.BRAZIL)

        for page in pdf_reader.pages:
            text = page.extract_text()
            if not text:
                continue  # Ignorar páginas vazias ou não legíveis
            redacted_text = anonymizer.anonymize(text)

            # Criar uma nova página com o texto redigido
            packet = io.BytesIO()
            packet.write(redacted_text.encode('utf-8'))
            pdf_writer.add_page(page)

        output_pdf = io.BytesIO()
        pdf_writer.write(output_pdf)
        output_pdf.seek(0)
        return send_file(output_pdf, download_name="redacted.pdf", as_attachment=True)

    # Processar Word
    elif filename.endswith('.docx'):
        doc = Document(uploaded_file)
        anonymizer = Anonymizer(preset=Preset.BRAZIL)

        for paragraph in doc.paragraphs:
            paragraph.text = anonymizer.anonymize(paragraph.text)

        # Salvar o documento redigido
        output_docx = io.BytesIO()
        doc.save(output_docx)
        output_docx.seek(0)
        return send_file(output_docx, download_name="redacted.docx", as_attachment=True)

    # Processar texto simples
    elif filename.endswith('.txt'):
        text = uploaded_file.read().decode('utf-8')
        anonymizer = Anonymizer(preset=Preset.BRAZIL)
        redacted_text = anonymizer.anonymize(text)

        # Salvar texto redigido
        output_txt = io.BytesIO()
        output_txt.write(redacted_text.encode('utf-8'))
        output_txt.seek(0)
        return send_file(output_txt, download_name="redacted.txt", as_attachment=True)

    else:
        return "Unsupported file format", 400


if __name__ == "__main__":
    app.run(debug=True)
