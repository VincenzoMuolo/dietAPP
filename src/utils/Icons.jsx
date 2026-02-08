// SVG Icons
const HomeIcon = () => (
    <svg className="icon" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const ShoppingCartIcon = () => (
    <svg className="icon" viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
);

const BookIcon = () => (
    <svg className="icon" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
);

const ChevronDownIcon = () => (
    <svg className="expand-icon" viewBox="0 0 24 24">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const LogoIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

const ArrowLeft = () =>(
    <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  width="48"  height="48"  fill="currentColor" opacity="0.3">
    <path d="M15.7 5.3a1 1 0 0 1 0 1.4L10.4 12l5.3 5.3a1 1 0 0 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0z"/>
</svg>
);
const ArrowRight = () =>(
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3">
  <path d="M8.3 18.7a1 1 0 0 1 0-1.4L13.6 12 8.3 6.7a1 1 0 0 1 1.4-1.4l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.4 0z"/>
</svg>
);

const SettingsIcon = () => (
    <svg width="30" height="30" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="14" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="14" cy="5.5" r="1.5" fill="currentColor"/>
        
        <rect x="3" y="12" width="14" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="6" cy="14.5" r="1.5" fill="currentColor"/>
    </svg>
);
export { HomeIcon, ShoppingCartIcon, BookIcon, ChevronDownIcon, LogoIcon, ArrowLeft, ArrowRight, SettingsIcon};