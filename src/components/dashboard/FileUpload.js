import React, { useState } from "react";
import { Card, Button, Spinner, Modal } from "react-bootstrap";
import { storage, db } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function FileUpload({ currentUser }) {
    const [error, setError] = useState("");
    const [file, setFile] = useState(null);
    const [coverPage, setCoverPage] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState(""); // New state for description
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
        setError("");
    };

    const handleCoverPageChange = (e) => {
        const coverPage = e.target.files[0];
        setCoverPage(coverPage);
        setError("");
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setError("");
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
        setError("");
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
                description,
                fileURL,
                coverPageURL,
                uploaderEmail: currentUser && currentUser.email,
                createdBy: currentUser && currentUser.uid,
                createdAt: new Date().toISOString(),
                views: 0,
            });

            setShowSuccessModal(true);

        } catch (error) {
            setError(error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (!file || !coverPage || !title) {
            setError("Please select a file, cover page, and provide a title.");
            return;
        }
        navigate("/textEditor", {
            state: {
                coverPageURL: URL.createObjectURL(coverPage),
                fileTitle: title,
                fileDescription: description
            }
        });
    };

    const handleCancel = () => {
        setError("");
        setFile(null);
        setCoverPage(null);
        setTitle("");
        setDescription("");
        setLoading(false);
        setShowSuccessModal(false);
        document.getElementById("fileInput").value = "";
        document.getElementById("coverPageInput").value = "";
    };

    return (
        <Card className="mb-3">
            <h2 className="text-center mb-4" style={{ color: "black" }}>File Upload</h2>
            <Card.Body>
                <input id="fileInput" type="file" className="form-control mb-2" onChange={handleFileChange} />
                <input id="coverPageInput" type="file" className="form-control mb-2" onChange={handleCoverPageChange} />
                <input type="text" className="form-control mb-2" placeholder="Title" value={title} onChange={handleTitleChange} />
                <textarea className="form-control mb-2" placeholder="Description" value={description} onChange={handleDescriptionChange} />
                {error && <p className="text-danger">{error}</p>}
                <Button onClick={handlePublish} className="btn btn-success btn-block" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : "Publish"}
                </Button>
                <Button onClick={handleNext} className="btn btn-primary btn-block mt-2" disabled={loading}>
                    Next
                </Button>
                <Button onClick={handleCancel} className="btn btn-danger btn-block mt-2">
                    Cancel
                </Button>
            </Card.Body>

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
