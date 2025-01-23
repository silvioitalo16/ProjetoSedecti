const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const uploadButton = document.getElementById('uploadButton');

const sensitivePatterns = [
    /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, // CPF (with or without formatting)
    /\b\d{2}\.\d{3}\.\d{3}-\d{1}\b/g,   // RG
    /\b\d{4,5}-\d{4}\b/g,               // Phone
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g // Email
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
