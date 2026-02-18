import React from 'react';
import { HomeIcon, ShoppingCartIcon, BookIcon, ScaleIcon, ChefIcon } from '../utils/Icons';

function Navigation({ currentPage, setCurrentPage, navVisible }) {
    return (
        <div className={`nav-container ${navVisible ? '' : 'hidden'}`}>
            <div className="nav-menu">
                <button
                    className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('home')}
                >
                    <HomeIcon />
                    <span className="nav-label">Piano</span>
                </button>
                <button
                    className={`nav-btn ${currentPage === 'shopping' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('shopping')}
                >
                    <ShoppingCartIcon />
                    <span className="nav-label">Spesa</span>
                </button>
                <button className={`nav-btn ${currentPage === 'recipes' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('recipes')}>
                    <ChefIcon />
                    <span className="nav-label">Ricette</span>
                </button>
                <button
                    className={`nav-btn ${currentPage === 'weight' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('weight')}>
                    <ScaleIcon />
                    <span className="nav-label">Peso</span>
                </button>
                <button
                    className={`nav-btn ${currentPage === 'cad' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('cad')} >
                    <BookIcon />
                    <span className="nav-label">CAD</span>
                </button>
            </div>
        </div>
    );
}

export default Navigation;