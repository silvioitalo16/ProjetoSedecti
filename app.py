from flask import Flask, render_template, request, send_file
import io

app = Flask(__name__)

@app.route('/')
def index():
    """Renderiza a página inicial."""
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    """Processa o arquivo PDF enviado."""
    if 'file' not in request.files:
        return "No file uploaded", 400

    file = request.files['file']
    if not file or not file.filename.endswith('.pdf'):
        return "Invalid file format. Please upload a PDF.", 400

    # Aqui você pode adicionar lógica adicional para salvar ou processar o PDF se necessário.
    return "File uploaded successfully!"

if __name__ == '__main__':
    app.run(debug=True)
