import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Modal } from "react-bootstrap";
import { storage, db } from "../../firebase";
import "react-toastify/dist/ReactToastify.css";

export default function FileUpload({ currentUser }) {
    const [error, setError] = useState("");
    const [file, setFile] = useState(null);
    const [coverPage, setCoverPage] = useState(null);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
    };

    const handleCoverPageChange = (e) => {
        const coverPage = e.target.files[0];
        setCoverPage(coverPage);
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handlePublish = async () => {
        setError("");
        setLoading(true);

        try {
            if (!file || !coverPage || !title) {
                throw new Error("Please select a file, cover page, and provide a title.");
            }

            const fileRef = storage.ref().child(file.name);
            await fileRef.put(file);

            const coverPageRef = storage.ref().child(coverPage.name);
            await coverPageRef.put(coverPage);

            const fileURL = await fileRef.getDownloadURL();
            const coverPageURL = await coverPageRef.getDownloadURL();

            const newFileKey = db.ref().child("files").push().key;
            await db.ref(`files/${newFileKey}`).set({
                title,
                fileURL,
                coverPageURL,
                uploaderEmail: currentUser.email,
                createdBy: currentUser.uid,
                createdAt: new Date().toISOString(),
                views: 0,
            });

            setShowSuccessModal(true); // Show success modal after successful upload

        } catch (error) {
            setError(error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-3">
            <h2 className="text-center mb-4" style={{ color: "black" }}>File Upload</h2>
            <Card.Body>
                <input type="file" className="form-control mb-2" onChange={handleFileChange} />
                <input type="file" className="form-control mb-2" onChange={handleCoverPageChange} />
                <input type="text" className="form-control mb-2" placeholder="Title" value={title} onChange={handleTitleChange} />
                {error && <p className="text-danger">{error}</p>}
                <Button onClick={handlePublish} className="btn btn-success btn-block" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : "Publish"}
                </Button>
            </Card.Body>

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>File Uploaded Successfully!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Your file has been successfully uploaded.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSuccessModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
}
