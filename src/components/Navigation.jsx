import React from 'react';
import { HomeIcon, ShoppingCartIcon, BookIcon } from '../utils/Icons';
function Navigation({ currentPage, setCurrentPage, navVisible }) {
    return (
        <div className={`nav-container ${navVisible ? '' : 'hidden'}`}>
            <div className="nav-menu">
                <button
                    className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('home')}
                >
                    <HomeIcon />
                    Piano
                </button>
                <button
                    className={`nav-btn ${currentPage === 'shopping' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('shopping')}
                >
                    <ShoppingCartIcon />
                    Spesa
                </button>
                <button
                    className={`nav-btn ${currentPage === 'cad' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('cad')}
                >
                    <BookIcon />
                    CAD
                </button>
            </div>
        </div>
    );
}

export default Navigation;