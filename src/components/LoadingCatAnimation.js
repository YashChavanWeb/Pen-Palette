// LoadingCatAnimation.js
import React from 'react';
import penPaletteLoader from '../images/penPaletteLoader.gif';

function LoadingCatAnimation() {
    return (
        <div style={{ textAlign: 'center', padding: '100px', backgroundColor: '#7f39c5' }}>
            <img src={penPaletteLoader} alt="Loading..." />
        </div>
    );
}

export default LoadingCatAnimation;
