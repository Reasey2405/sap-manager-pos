import { useRef, useEffect } from 'react'
import { SunIcon, MoonIcon } from './Icons'

function Navbar({
    sections,
    activeSection,
    mobileMenuOpen,
    setMobileMenuOpen,
    scrollToSection,
    theme,
    toggleTheme,
}) {
    const mobileMenuRef = useRef(null)
    const hamburgerRef = useRef(null)

    /* Close mobile menu when clicking outside */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                mobileMenuOpen &&
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(e.target) &&
                hamburgerRef.current &&
                !hamburgerRef.current.contains(e.target)
            ) {
                setMobileMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [mobileMenuOpen, setMobileMenuOpen])

    /* Close mobile menu on resize if going back to desktop */
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setMobileMenuOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [setMobileMenuOpen])

    return (
        <nav className="navbar" id="main-navbar">
            {/* Hamburger button (visible only on mobile) */}
            <button
                className={`hamburger-btn ${mobileMenuOpen ? 'open' : ''}`}
                id="hamburger-btn"
                ref={hamburgerRef}
                onClick={() => setMobileMenuOpen(prev => !prev)}
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
            >
                <span className="hamburger-line" />
                <span className="hamburger-line" />
                <span className="hamburger-line" />
            </button>

            {/* Desktop nav items */}
            <div className="navbar-menu">
                {sections.map((section, idx) => {
                    const isAnyCardImplemented = section.cards.some(card => card.isImplemented);
                    return (
                        <div key={section.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <button
                                className={`navbar-item ${activeSection === section.id ? 'active' : ''} ${!isAnyCardImplemented ? 'not-implemented' : ''}`}
                                id={`nav-${section.id}`}
                                onClick={() => scrollToSection(section.id)}
                            >
                                {section.label}
                            </button>
                            {idx < sections.length - 1 && <span className="navbar-separator" />}
                        </div>
                    );
                })}
            </div>

            <div className="navbar-right">
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    id="theme-toggle-btn"
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    <div className={`toggle-switch ${theme === 'light' ? 'active' : ''}`} />
                </button>
            </div>

            {/* Mobile dropdown menu */}
            <div
                className={`mobile-dropdown ${mobileMenuOpen ? 'open' : ''}`}
                ref={mobileMenuRef}
                id="mobile-dropdown"
            >
                {sections.map((section) => {
                    const isAnyCardImplemented = section.cards.some(card => card.isImplemented);
                    return (
                        <button
                            className={`mobile-dropdown-item ${activeSection === section.id ? 'active' : ''} ${!isAnyCardImplemented ? 'not-implemented' : ''}`}
                            key={section.id}
                            id={`mobile-nav-${section.id}`}
                            onClick={() => scrollToSection(section.id)}
                        >
                            {section.label}
                        </button>
                    );
                })}
            </div>
        </nav>
    )
}

export default Navbar
