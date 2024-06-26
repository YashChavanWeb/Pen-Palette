import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JoditEditor from 'jodit-react';
import { useAuth } from '../../contexts/AuthContexts';
import { db, storage } from '../../firebase'; // Import the Firebase database and storage instances
import '../../styles/Text_Editor/TextEditor.css';
import SideDrawer from './SideDrawer';

function TextEditor() {
    const { currentUser } = useAuth();
    const [chapterName, setChapterName] = useState('');
    const [content, setContent] = useState('');
    const [chapters, setChapters] = useState([]);
    const [activeChapterIndex, setActiveChapterIndex] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const editorRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();

    const uploadedFileTitle = location.state?.fileTitle;
    const uploadedFileDescription = location.state?.fileDescription;
    const coverPageURL = location.state?.coverPageURL;

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const goBack = () => {
        navigate('/dashboard');
    };

    async function downloadPdf() {
        const pdf = new jsPDF('p', 'pt', 'a4');
        pdf.setFontSize(12);

        try {
            if (!coverPageURL) {
                throw new Error("Cover page URL is missing or invalid");
            }

            const uploaderEmail = currentUser ? currentUser.email : 'abc@gmail.com'; // Use default email if currentUser is not available

            const pdfPromises = chapters.map((chapter, index) => {
                return new Promise((resolve, reject) => {
                    const chapterElement = document.getElementById(`pdf-chapter-${index}`);

                    html2canvas(chapterElement, { scale: 2 }).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const imgWidth = 595.28; // Width of A4 page
                        const pageHeight = 842; // Height of A4 page
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;

                        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pageHeight);

                        if (index !== chapters.length - 1) {
                            pdf.addPage();
                        }
                        resolve();
                    }).catch(error => reject(error));
                });
            });

            await Promise.all(pdfPromises);

            const fileName = `${uploadedFileTitle}.pdf`; // Use title name for the PDF file
            pdf.save(fileName);

            const pdfFileRef = storage.ref().child(fileName);
            await pdfFileRef.put(pdf.output('blob')); // Upload PDF file

            const pdfURL = await pdfFileRef.getDownloadURL();

            // Upload cover page to Firebase Storage
            const coverPageRef = storage.ref().child(`covers/${fileName}`);
            const response = await fetch(coverPageURL);
            const coverPageBlob = await response.blob();
            await coverPageRef.put(coverPageBlob);

            // Get the download URL for the cover page
            const coverPageDownloadURL = await coverPageRef.getDownloadURL();

            const newFileKey = db.ref().child("files").push().key;
            const newFileRef = db.ref(`files/${newFileKey}`);
            await newFileRef.set({
                title: uploadedFileTitle,
                description: uploadedFileDescription,
                coverPageURL: coverPageDownloadURL, // Use the downloaded cover page URL
                pdfURL,
                uploaderEmail: currentUser ? currentUser.email : 'abc@gmail.com',
                createdBy: currentUser ? currentUser.uid : null,
                createdAt: new Date().toISOString(),
                views: 0
            });

            // Save chapters to the new file's chapters node
            await newFileRef.child('chapters').set(chapters);

            alert("File published successfully!");

            // Navigate to the book preview page
            navigate(`/book/${newFileKey}`);
        } catch (error) {
            console.error("Error publishing file:", error);
            alert("An error occurred while publishing the file. Please try again.");
        }
    }


    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgBase64 = e.target.result;
            setContent((prevContent) => `${prevContent}<img src="${imgBase64}" alt="Uploaded Image" class="uploaded-image" />`);
        };
        reader.readAsDataURL(file);
    };

    const handleTextFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const textContent = e.target.result;
            setContent((prevContent) => `${prevContent}<pre>${textContent}</pre>`);
        };
        reader.readAsText(file);
    };

    const addChapter = () => {
        if (!chapterName.trim() || !content.trim()) {
            alert("Chapter name and content cannot be empty");
            return;
        }

        const newChapter = {
            name: chapterName,
            content: content
        };

        if (editingIndex !== null) {
            const updatedChapters = [...chapters];
            updatedChapters[editingIndex] = newChapter;
            setChapters(updatedChapters);
            setEditingIndex(null);
        } else {
            setChapters([...chapters, newChapter]);
        }

        setChapterName('');
        setContent('');
    };

    const editChapter = (index) => {
        setChapterName(chapters[index].name);
        setContent(chapters[index].content);
        setEditingIndex(index);
    };

    const saveStory = async () => {
        try {
            if (chapters.length === 0) {
                alert("No chapters to save");
                return;
            }

            // Save the working story to the "My Stories" node in the database
            const storyRef = await db.ref('MyStories').push();
            const storyId = storyRef.key;

            // Save story details without the PDF
            await storyRef.set({
                title: uploadedFileTitle,
                description: uploadedFileDescription,
                chapters: chapters,
                createdAt: new Date().toISOString(),
                createdBy: currentUser ? currentUser.uid : null
            });

            // Save the cover page image to storage with the story ID as filename
            const coverPageRef = storage.ref().child(`covers/${storyId}`);
            await coverPageRef.putString(coverPageURL, 'data_url');

            alert("Story saved successfully!");
        } catch (error) {
            console.error("Error saving story:", error);
            alert("An error occurred while saving the story. Please try again.");
        }
    };

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

    // Effect to scroll to active chapter
    useEffect(() => {
        if (activeChapterIndex !== null && editorRef.current) {
            const chapterElement = document.getElementById(`chapter-${activeChapterIndex}`);
            if (chapterElement) {
                chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [activeChapterIndex]);

    return (
        <div className="text-editor-container">
            <div className="button-section">
                <div>
                    <button onClick={toggleDrawer}>Toggle Drawer</button>
                    <SideDrawer isOpen={isDrawerOpen} toggle={toggleDrawer} chapters={chapters} setActiveChapterIndex={setActiveChapterIndex} />
                    {/* Other content of your app */}
                </div>
                <button className="go-back-button" onClick={goBack}>Go Back</button>
                <button className="add-btn" onClick={addChapter}>{editingIndex !== null ? 'Update' : 'Add'}</button>
                <button className="publish-button" onClick={downloadPdf}>Publish</button>
            </div>

            <div className="section title-section">
                {coverPageURL && (
                    <div className="cover-page">
                        <img src={coverPageURL} alt="Cover Page" style={{ height: 100 }} />
                    </div>
                )}
                <div className="title-description-container">
                    <h1 className="title">{uploadedFileTitle}</h1>
                    <p className="description">{uploadedFileDescription}</p>
                </div>
            </div>

            <div className="section email-section">
                <p>Email: {currentUser ? currentUser.email : 'Not logged in'}</p>
            </div>

            {chapters.map((chapter, index) => (
                <div key={index} id={`chapter-${index}`} className={`section editor-section ${index === activeChapterIndex ? 'active-chapter' : ''}`}>
                    <h2>{chapter.name}</h2>
                    <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                    <button className="edit-btn" onClick={() => editChapter(index)}>Edit</button>
                </div>
            ))}

            {/*<div className="hidden-pdf-container">
                {chapters.map((chapter, index) => (
                    <div key={index} id={`pdf-chapter-${index}`} className="pdf-chapter">
                        <h2>{chapter.name}</h2>
                        <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                    </div>
                ))}
            </div>*/}

            <div className="section editor-section">
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
                    ref={editorRef}
                />
                <div className="upload-section">
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                    <input type="file" accept=".txt" onChange={handleTextFileUpload} />
                </div>
            </div>

            <div className="button-section">
                <button className="save-btn" onClick={saveStory}>Save</button>
            </div>
        </div>
    );
}

export default TextEditor;
