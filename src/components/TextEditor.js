import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JoditEditor from 'jodit-react';
import '../styles/TextEditor.css';

function TextEditor() {
    const [chapterName, setChapterName] = useState('');
    const [content, setContent] = useState('');
    const editorRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();

    const uploadedFileTitle = location.state?.fileTitle;
    const uploadedFileDescription = location.state?.fileDescription;

    const goBack = () => {
        navigate('/dashboard');
    };

    const downloadPdf = () => {
        if (!editorRef.current) return;

        const pdf = new jsPDF('p', 'pt', 'a4');
        pdf.setFontSize(12);

        html2canvas(editorRef.current).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 595.28; // A4 width in pixels
            const pageHeight = 842; // A4 height in pixels
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('text_editor_content.pdf');
        });
    };

    // Function to handle image upload
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgBase64 = e.target.result;
            setContent((prevContent) => `${prevContent}<img src="${imgBase64}" alt="Uploaded Image" />`);
        };
        reader.readAsDataURL(file);
    };

    // Function to handle text file upload
    const handleTextFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const textContent = e.target.result;
            setContent((prevContent) => `${prevContent}<pre>${textContent}</pre>`);
        };
        reader.readAsText(file);
    };

    // Jodit editor configuration with desired options
    const editorConfig = {
        readonly: false,
        toolbarAdaptive: false,
        buttons: [
            'bold', 'italic', 'underline', '|',
            'alignleft', 'aligncenter', 'alignright', '|',
            'ul', 'ol', '|',
            'brush', '|',
            'undo', 'redo'
        ],
        height: 600
    };

    return (
        <div className="text-editor-container">
            <div className="section go-back">
                <button onClick={goBack}>Go Back</button>
            </div>

            <div className="section uploaded-file-section">
                <h2>Uploaded File Details</h2>
                <p><strong>Title:</strong> {uploadedFileTitle}</p>
                <p><strong>Description:</strong> {uploadedFileDescription}</p>
            </div>

            <div ref={editorRef} className="section editor-section">
                <div className="editor-content">
                    <input
                        type="text"
                        value={chapterName}
                        placeholder="Chapter Name"
                        onChange={(e) => setChapterName(e.target.value)}
                        className="input-field"
                    />
                    <br />
                    <JoditEditor
                        value={content}
                        config={editorConfig}
                        tabIndex={1}
                        onBlur={(newContent) => setContent(newContent)}
                        className="editor"
                    />
                </div>
            </div>

            <div className="section button-section">
                <button className="publish-btn" onClick={downloadPdf}>Publish</button>
            </div>

            <div className="section upload-section">
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                <input type="file" accept=".txt" onChange={handleTextFileUpload} />
            </div>
        </div>
    );
}

export default TextEditor;
