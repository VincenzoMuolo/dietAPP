import React from 'react';
import { SettingsIcon } from '../utils/Icons';

function Header({ onInfoClick }) {
    return (
        <div className="header glass-strong">
            <div className="logo-container">
                <div className="logo-icon">
                    <img src="/logo.png" alt="" width="48px" height="48px" />
                </div>
                <div className="logo-text">DietAPP</div>
            </div>
            <button className="info-icon" onClick={onInfoClick} aria-label="Settings">
                <SettingsIcon />
            </button>
        </div>
    );
}

export default Header;
