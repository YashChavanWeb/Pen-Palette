// Navbar.js

import React, { useState } from "react";
import PopupModal from "./PopupModal";
import '../../styles/Navbar/Navbar.css';

function Navbar() {
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState({ title: "", content: "" });

    const handleTabClick = (content) => {
        setPopupContent(content);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    return (
        <nav className="navbar">
            <ul className="nav-links">
                <li><button onClick={() => handleTabClick({ title: "Home Info", content: "Content for Home" })}>Home</button></li>
                <li><button onClick={() => handleTabClick({ title: "About Info", content: "Content for About" })}>About</button></li>
                <li><button onClick={() => handleTabClick({ title: "Services Info", content: "Content for Services" })}>Services</button></li>
                <li><button onClick={() => handleTabClick({ title: "Contact Info", content: "Content for Contact" })}>Contact</button></li>
            </ul>
            <PopupModal show={showPopup} onHide={handleClosePopup} content={popupContent} />
        </nav>
    );
}

export default Navbar;