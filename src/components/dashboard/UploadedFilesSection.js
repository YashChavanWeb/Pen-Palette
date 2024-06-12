import React, { useState, useEffect } from "react";
import { Button, Spinner, Modal, Form } from "react-bootstrap";
import { db } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/dashboard.css"; // Import the dashboard CSS file

export default function UploadedFilesSection({ currentUser }) {
    const [loading, setLoading] = useState(false);
    const [fileData, setFileData] = useState([]);
    const [toastVisible, setToastVisible] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editCoverPageURL, setEditCoverPageURL] = useState("");
    const [fileToEdit, setFileToEdit] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [fileComments, setFileComments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const unsubscribe = db.ref("files").on("value", (snapshot) => {
            if (snapshot) {
                const files = [];
                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    if (data.createdBy === currentUser.uid) {
                        files.push({
                            id: childSnapshot.key,
                            ...data
                        });
                    }
                });
                setFileData(files);
            } else {
                setFileData([]);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [currentUser]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredFiles = fileData.filter(
        (file) =>
            file.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const showToast = (message) => {
        try {
            toast.success(message, { autoClose: 1500, onClose: () => setToastVisible(false) });
            setToastVisible(true);
        } catch (error) {
            console.error("Error displaying toast:", error);
        }
    };

    const handleDelete = async (fileId) => {
        try {
            setLoading(true);
            await db.ref(`files/${fileId}`).remove();
            showToast("File deleted successfully!");
        } catch (error) {
            console.error(error);
            showToast("Failed to delete file");
        } finally {
            setLoading(false);
            setFileToDelete(null);
            setShowConfirmDelete(false);
        }
    };

    const deleteFiles = async (fileIds) => {
        if (toastVisible) return; // Prevent deleting files if toast is visible
        try {
            setLoading(true);
            await Promise.all(fileIds.map((fileId) => handleDelete(fileId)));
        } finally {
            setLoading(false);
        }
    };

    const openFile = async (fileId, fileURL, createdBy) => {
        try {
            if (createdBy !== currentUser.uid) {
                await db.ref(`files/${fileId}/views`).transaction((currentViews) => {
                    return (currentViews || 0) + 1;
                });
            }
            setSelectedFile({ id: fileId, fileURL });
            setShowCommentsModal(true);
            fetchComments(fileId);
        } catch (error) {
            console.error(error);
            showToast("Failed to open file");
        }
    };

    const fetchComments = async (fileId) => {
        try {
            const snapshot = await db.ref(`files/${fileId}/comments`).once("value");
            const comments = [];
            snapshot.forEach((childSnapshot) => {
                comments.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            setFileComments(comments);
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch comments");
        }
    };

    const handleConfirmDelete = (fileId) => {
        setFileToDelete(fileId);
        setShowConfirmDelete(true);
    };

    const handleEdit = (file) => {
        setEditTitle(file.title);
        setEditCoverPageURL(file.coverPageURL);
        setFileToEdit(file);
        setShowEditModal(true);
    };

    const saveEditedFile = async () => {
        try {
            setLoading(true);
            await db.ref(`files/${fileToEdit.id}`).update({
                title: editTitle
            });
            showToast("File updated successfully!");
        } catch (error) {
            console.error(error);
            showToast("Failed to update file");
        } finally {
            setLoading(false);
            setShowEditModal(false);
            setFileToEdit(null);
        }
    };

    const resetEditForm = () => {
        setEditTitle(fileToEdit.title);
    };

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const suffix = getSuffix(day);
        return `${day}${suffix} ${month} ${year}`;
    }

    function formatTime(timeString) {
        const time = new Date(timeString);
        let hours = time.getHours();
        const minutes = time.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? 12 : 0; // Handle midnight
        const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
        return formattedTime;
    }

    function getSuffix(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    return (
        <div className="center-section">
            <br />
            <br />
            <br />
            <br />

            <h2 className="text-center mb-4" style={{ color: "white" }}>Your Uploaded Files</h2>
            <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="form-control mb-3"
                id="searchbar"
            />
            <div className="row">
                {filteredFiles.map((file) => (
                    <div key={file.id} className="col-md-4 mb-4">
                        <div className="cardbitch">
                            <img
                                src={file.coverPageURL}
                                alt="Cover Page"
                                className="card-img-top"
                                style={{ height: "300px", cursor: "pointer", borderRadius: "10px" }}
                                onClick={() => openFile(file.id, file.fileURL, file.createdBy)}
                            />
                            <div className="card-body">
                                <h5 className="card-title">{file.title}</h5>
                                <p className="card-text">Uploaded: {formatDate(file.createdAt)}</p>
                                <p className="card-text">Views: {file.views}</p>

                                {file.createdBy !== currentUser.uid && (
                                    <>
                                        <p className="card-text">Likes: {file.likes}</p>
                                    </>
                                )}

                                <Button variant="primary" onClick={() => handleEdit(file)} disabled={loading} className="bttn">
                                    Edit
                                </Button>{" "}
                                <Button variant="danger" onClick={() => handleConfirmDelete(file.id)} disabled={loading} className="bttn">
                                    {loading ? <Spinner animation="border" size="sm" /> : "Delete"}
                                </Button>
                                <Button variant="info" onClick={() => openFile(file.id, file.fileURL, file.createdBy)} className="bttn">
                                    Comments
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit File</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formFileTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formCoverPageURL">
                            <Form.Label>Cover Page URL</Form.Label>
                            <Form.Control
                                type="text"
                                value={editCoverPageURL}
                                onChange={(e) => setEditCoverPageURL(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={saveEditedFile}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this file?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => deleteFiles([fileToDelete])}>
                        {loading ? <Spinner animation="border" size="sm" /> : "Delete"}
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </div>
    );
}
