const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const uploadButton = document.getElementById('uploadButton');

const sensitivePatterns = [
    // CPF: Formatos com ou sem pontuação (xxx.xxx.xxx-xx ou xxxxxxxxxxx)
    /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,

    // RG: Formatos comuns como xx.xxx.xxx-x
    /\b\d{1,2}\.?\d{3}\.?\d{3}-?\d{1}\b/g,

    // Telefones: Suporte a formatos com e sem DDD, com ou sem espaços e traços
    /\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}\b/g,

    // E-mails: Padrão mais robusto para validação de e-mails
    /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,

    // CEP: Formato brasileiro de CEP (xxxxx-xxx ou xxxxxxxx)
    /\b\d{5}-?\d{3}\b/g,

    // CNPJ: Formatos com ou sem pontuação (xx.xxx.xxx/xxxx-xx ou xxxxxxxxxxxxxx)
    /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,

    // Cartões de crédito: Padrão genérico de 16 dígitos agrupados ou contínuos
    /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,

    // Endereços IP: IPv4 e IPv6
    /\b\d{1,3}(\.\d{1,3}){3}\b|\b([a-fA-F0-9:]+:+)+[a-fA-F0-9]+\b/g,

    // Data de nascimento: Formatos DD/MM/AAAA ou DD-MM-AAAA
    /\b\d{2}[\/-]\d{2}[\/-]\d{4}\b/g
];

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.backgroundColor = '#eef1ff';
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.backgroundColor = '#f8f9ff';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.backgroundColor = '#f8f9ff';
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        fileInfo.textContent = `Selected file: ${file.name}`;
        fileInput.files = e.dataTransfer.files;
    } else {
        fileInfo.textContent = 'Please select a valid PDF file.';
    }
});

uploadBox.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file && file.type === 'application/pdf') {
        fileInfo.textContent = `Selected file: ${file.name}`;
    } else {
        fileInfo.textContent = 'Please select a valid PDF file.';
    }
});

uploadButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (file && file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();

        // Use PDF.js to extract text content
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

        for (let i = 0; i < pdf.numPages; i++) {
            const page = await pdf.getPage(i + 1);
            const textContent = await page.getTextContent();
            const pdfPage = pdfDoc.getPages()[i];
            textContent.items.forEach((item) => {
                sensitivePatterns.forEach((pattern) => {
                    if (pattern.test(item.str)) {
                        pdfPage.drawRectangle({
                            x: item.transform[4],
                            y: item.transform[5],
                            width: item.width || 200,
                            height: 20,
                            color: PDFLib.rgb(0, 0, 0),
                        });
                    }
                });
            });
        }

        const modifiedPdfBytes = await pdfDoc.save();
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        saveAs(blob, 'censored-document.pdf');
    } else {
        alert('Please select a valid PDF file before uploading.');
    }
});
