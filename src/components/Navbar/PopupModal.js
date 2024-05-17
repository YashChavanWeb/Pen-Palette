
// PopupModal.js

import React from "react";
import { Modal, Button } from "react-bootstrap";
import '../../styles/Navbar/PopupModal.css';

function PopupModal({ show, onHide, content }) {
    const { title, content: popupContent } = content;

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {popupContent}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PopupModal;