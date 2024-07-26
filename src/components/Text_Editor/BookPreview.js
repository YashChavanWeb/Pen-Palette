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
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-lg text-gray-700">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen">
            <div className="flex items-center justify-between p-4 bg-gray-800 text-white shadow-md">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
                >
                    Back to Dashboard
                </button>
                <button
                    onClick={toggleDrawer}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
                >
                    Toggle Drawer
                </button>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 bg-white border-l border-gray-200" ref={contentRef}>
                    <h1 className="text-3xl font-bold mb-4">{bookData.title}</h1>
                    {bookData.coverPageURL && (
                        <img
                            src={bookData.coverPageURL}
                            alt="Cover Page"
                            className="w-48 h-72 object-cover mb-4"
                        />
                    )}
                    <p className="text-gray-700 mb-6">{bookData.description}</p>
                    {bookData.chapters && bookData.chapters.length > 0 ? (
                        bookData.chapters.map((chapter, index) => (
                            <div
                                key={index}
                                id={`chapter-${index}`}
                                className={`mb-6 ${index === activeChapterIndex ? 'border-l-4 border-blue-600 bg-blue-50' : ''}`}
                            >
                                <h2 className="text-2xl font-semibold mb-2">{chapter.name}</h2>
                                <div className="text-gray-900" dangerouslySetInnerHTML={{ __html: chapter.content }} />
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No chapters available</p>
                    )}
                </div>
                <SideDrawer
                    isOpen={isDrawerOpen}
                    toggle={toggleDrawer}
                    chapters={bookData.chapters}
                    navigateToChapter={navigateToChapter}
                />
            </div>
        </div>
    );
}

export default BookPreview;
