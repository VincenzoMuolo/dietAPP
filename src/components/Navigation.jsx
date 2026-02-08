import React from 'react';
import { HomeIcon, ShoppingCartIcon, BookIcon } from '../utils/Icons';

function Navigation({ currentPage, setCurrentPage, navVisible }) {
    return (
        <div className={`nav-container ${navVisible ? '' : 'hidden'}`}>
            <div className="nav-menu">
                <button
                    className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('home')}>
                    Piano
                </button>
                <button
                    className={`nav-btn ${currentPage === 'shopping' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('shopping')}>
                    Spesa
                </button>
                <button
                    className={`nav-btn ${currentPage === 'cad' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('cad')}>
                    CAD
                </button>
                <button className={`nav-btn ${currentPage === 'weight' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('weight')}>
                    Pesate
                </button>
            </div>
        </div>
    );
}

export default Navigation;
