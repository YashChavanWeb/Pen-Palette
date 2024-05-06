import React, { useState } from "react";
import Profile from "./profile";
import FileUpload from "./FileUpload";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "../../styles/profiledrawer.css";

const ProfileDrawer = ({ isOpen, onClose, currentUser, fileData, setLoading }) => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);

    const handleOpenProfileModal = () => {
        setShowProfileModal(true);
    };

    const handleCloseProfileModal = () => {
        setShowProfileModal(false);
    };

    const handleOpenFileUploadModal = () => {
        setShowFileUploadModal(true);
    };

    const handleCloseFileUploadModal = () => {
        setShowFileUploadModal(false);
    };

    return (
        <div className={`profile-drawer ${isOpen ? "open" : ""}`}>
            <div className="left-section">
                <Button onClick={handleOpenProfileModal}>Profile</Button>
                <Button onClick={handleOpenFileUploadModal}>Upload File</Button> {/* Added button to open file upload modal */}
            </div>

            <button className="close-button" onClick={onClose}>Close</button>

            {/* Profile Modal */}
            <Modal show={showProfileModal} onHide={handleCloseProfileModal}>
                <Modal.Header closeButton>
                    <Modal.Title>User Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Profile />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseProfileModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* File Upload Modal */}
            <Modal show={showFileUploadModal} onHide={handleCloseFileUploadModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload File</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FileUpload currentUser={currentUser} setLoading={setLoading} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseFileUploadModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ProfileDrawer;
