import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import SideDrawer from './SideDrawer'; // Assuming you have a SideDrawer component similar to the one in TextEditor

function BookPreview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bookData, setBookData] = useState(null);
    const [activeChapterIndex, setActiveChapterIndex] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        const fetchBookData = async () => {
            const bookRef = db.ref(`files/${id}`);
            const snapshot = await bookRef.once('value');
            setBookData(snapshot.val());
        };

        fetchBookData();
    }, [id]);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const navigateToChapter = (index) => {
        setActiveChapterIndex(index);
        if (contentRef.current) {
            contentRef.current.scrollTo({
                top: contentRef.current.childNodes[index].offsetTop,
                behavior: 'smooth'
            });
        }
        toggleDrawer(); // Close the drawer after navigating to the chapter
    };

    if (!bookData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="book-preview">
            <div className="button-section">
                <button onClick={toggleDrawer}>Toggle Drawer</button>
            </div>
            <div className="content-section" ref={contentRef}>
                <h1>{bookData.title}</h1>
                {bookData.coverPageURL && (
                    <img src={bookData.coverPageURL} alt="Cover Page" style={{ height: 100 }} />
                )}
                <p>{bookData.description}</p>
                {bookData.chapters && bookData.chapters.length > 0 ? (
                    bookData.chapters.map((chapter, index) => (
                        <div key={index} id={`chapter-${index}`} className={index === activeChapterIndex ? 'active-chapter' : ''}>
                            <h2>{chapter.name}</h2>
                            <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                        </div>
                    ))
                ) : (
                    <p>No chapters available</p>
                )}
            </div>
            <SideDrawer isOpen={isDrawerOpen} toggle={toggleDrawer} chapters={bookData.chapters} navigateToChapter={navigateToChapter} />
        </div>
    );
}

export default BookPreview;
