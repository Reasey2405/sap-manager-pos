import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import sections from './data/sections'
import Navbar from './components/Navbar'
import ContentSection from './components/ContentSection'
import MonitoringPage from './components/MonitoringPage'
import OrgStructurePage from './components/OrgStructurePage'
import BankInformationPage from './components/BankInformationPage'
import PaymentMethodsPage from './components/PaymentMethodsPage'
import MasterDataSyncPage from './components/MasterDataSyncPage'
import LoginPage from './components/LoginPage'
import UserManagementPage from './components/UserManagementPage'
import ReceiptNumberingPage from './components/ReceiptNumberingPage'
import ReportsPage from './components/ReportsPage'
import './components/MonitoringPage.css'
import './components/ReportsPage.css'
import './components/ReceiptNumberingPage.css'
import './components/OrgStructurePage.css'
import './components/BankInformationPage.css'
import './components/PaymentMethodsPage.css'
import './components/LoginPage.css'

import { isAuthenticated, onSessionExpired, logout } from './service/auth'

/* ===== App Component ===== */
function App() {
  const [loggedIn, setLoggedIn] = useState(() => isAuthenticated())
  const [sessionExpired, setSessionExpired] = useState(false)

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sap-theme')
    return saved || 'dark'
  })
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('page') || 'dashboard'
  })
  const sectionRefs = useRef({})
  const isClickScrolling = useRef(false)

  // Listen for session expiration from the auth service
  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      setSessionExpired(true)
      setLoggedIn(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('sap-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  /* Scroll-spy: update active nav based on scroll position */
  const handleScroll = useCallback(() => {
    if (isClickScrolling.current) return

    const offset = 100
    let current = sections[0].id

    for (const section of sections) {
      const el = sectionRefs.current[section.id]
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= offset) {
          current = section.id
        }
      }
    }

    setActiveSection(current)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      setCurrentPage(params.get('page') || 'dashboard')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigateToPage = (page) => {
    setCurrentPage(page)
    const url = new URL(window.location.href)
    if (page === 'dashboard') {
      url.searchParams.delete('page')
    } else {
      url.searchParams.set('page', page)
    }
    window.history.pushState({}, '', url)

    if (page !== 'dashboard') {
      window.scrollTo(0, 0)
    }
  }

  /* Navigate to section on nav click */
  const scrollToSection = (sectionId) => {
    // If on a sub-page, go back to dashboard first
    if (currentPage !== 'dashboard') {
      navigateToPage('dashboard')
      // Wait for dashboard to render, then scroll
      setTimeout(() => {
        const el = sectionRefs.current[sectionId]
        if (el) {
          isClickScrolling.current = true
          setActiveSection(sectionId)
          setMobileMenuOpen(false)
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          setTimeout(() => { isClickScrolling.current = false }, 800)
        }
      }, 100)
      return
    }

    const el = sectionRefs.current[sectionId]
    if (el) {
      isClickScrolling.current = true
      setActiveSection(sectionId)
      setMobileMenuOpen(false)

      el.scrollIntoView({ behavior: 'smooth', block: 'start' })

      // Re-enable scroll-spy after animation
      setTimeout(() => {
        isClickScrolling.current = false
      }, 800)
    }
  }

  /* Handle card click — navigate to sub-pages */
  const handleCardClick = (cardTitle) => {
    if (cardTitle === 'Monitoring') {
      navigateToPage('monitoring')
    } else if (cardTitle === 'Organizational structure') {
      navigateToPage('org-structure')
    } else if (cardTitle === 'Bank Information') {
      navigateToPage('bank-information')
    } else if (cardTitle === 'Payment methods') {
      navigateToPage('payment-methods')
    } else if (cardTitle === 'Master data sync') {
      navigateToPage('master-data-sync')
    } else if (cardTitle === 'User management') {
      navigateToPage('user-management')
    } else if (cardTitle === 'Receipt Numbering') {
      navigateToPage('general-settings')
    } else if (cardTitle === 'Reports') {
      navigateToPage('reports')
    }
  }

  const handleLogout = () => {
    logout()
    setLoggedIn(false)
    setSessionExpired(false)
  }

  // ── Show Login if not authenticated ──────────────────────────
  if (!loggedIn) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setLoggedIn(true)
          setSessionExpired(false)
        }}
      />
    )
  }

  // ── Session Expired Overlay ──────────────────────────────────
  const sessionExpiredOverlay = sessionExpired && (
    <div className="session-expired-overlay" onClick={() => handleLogout()}>
      <div className="session-expired-card" onClick={(e) => e.stopPropagation()}>
        <svg className="session-expired-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <h3>Session Expired</h3>
        <p>Your session has timed out. Please sign in again to continue.</p>
        <button className="session-expired-btn" onClick={handleLogout}>
          <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
            <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Sign In Again
        </button>
      </div>
    </div>
  )

  /* Render sub-pages */
  if (currentPage === 'monitoring') {
    return (
      <div className="app">
        <Navbar
          sections={sections}
          activeSection={activeSection}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          scrollToSection={scrollToSection}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
        <MonitoringPage onBack={() => navigateToPage('dashboard')} />
        {sessionExpiredOverlay}
      </div>
    )
  }

  if (currentPage === 'org-structure') {
    return (
      <div className="app">
        <Navbar
          sections={sections}
          activeSection={activeSection}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          scrollToSection={scrollToSection}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
        <OrgStructurePage onBack={() => navigateToPage('dashboard')} />
        {sessionExpiredOverlay}
      </div>
    )
  }

  if (currentPage === 'bank-information') {
    return (
      <div className="app">
        <Navbar
          sections={sections}
          activeSection={activeSection}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          scrollToSection={scrollToSection}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
        <BankInformationPage onBack={() => navigateToPage('dashboard')} />
        {sessionExpiredOverlay}
      </div>
    )
  }

  if (currentPage === 'payment-methods') {
    return (
      <div className="app">
        <Navbar
          sections={sections}
          activeSection={activeSection}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          scrollToSection={scrollToSection}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
        <PaymentMethodsPage onBack={() => navigateToPage('dashboard')} />
        {sessionExpiredOverlay}
      </div>
    )
  }

  if (currentPage === 'master-data-sync') {
    return (
      <div className="app">
        <Navbar
          sections={sections}
          activeSection={activeSection}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          scrollToSection={scrollToSection}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
        <MasterDataSyncPage onBack={() => navigateToPage('dashboard')} />
        {sessionExpiredOverlay}
      </div>
    )
  }

  if (currentPage === 'user-management') {
    return (
      <div className="app">
        <Navbar
          sections={sections}
          activeSection={activeSection}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          scrollToSection={scrollToSection}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
        <UserManagementPage onBack={() => navigateToPage('dashboard')} />
        {sessionExpiredOverlay}
      </div>
    )
  }

  if (currentPage === 'general-settings') {
    return (
      <div className="app">
        <Navbar
          sections={sections}
          activeSection={activeSection}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          scrollToSection={scrollToSection}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
        <ReceiptNumberingPage onBack={() => navigateToPage('dashboard')} />
        {sessionExpiredOverlay}
      </div>
    )
  }

  if (currentPage === 'reports') {
    return (
      <div className="app">
        <Navbar
          sections={sections}
          activeSection={activeSection}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          scrollToSection={scrollToSection}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
        <ReportsPage onBack={() => navigateToPage('dashboard')} />
        {sessionExpiredOverlay}
      </div>
    )
  }

  return (
    <div className="app">
      <Navbar
        sections={sections}
        activeSection={activeSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        scrollToSection={scrollToSection}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <main className="main-content" id="main-content">
        {sections.map((section, sIdx) => (
          <ContentSection
            key={section.id}
            section={section}
            animationDelay={0.1 + sIdx * 0.08}
            onCardClick={handleCardClick}
            ref={(el) => {
              sectionRefs.current[section.id] = el
            }}
          />
        ))}
      </main>

      {sessionExpiredOverlay}
    </div>
  )
}

export default App
