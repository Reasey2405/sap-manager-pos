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
import './components/MonitoringPage.css'
import './components/OrgStructurePage.css'
import './components/BankInformationPage.css'
import './components/PaymentMethodsPage.css'

/* ===== App Component ===== */
function App() {
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
    }
  }

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
        />
        <MonitoringPage onBack={() => navigateToPage('dashboard')} />
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
        />
        <OrgStructurePage onBack={() => navigateToPage('dashboard')} />
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
        />
        <BankInformationPage onBack={() => navigateToPage('dashboard')} />
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
        />
        <PaymentMethodsPage onBack={() => navigateToPage('dashboard')} />
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
        />
        <MasterDataSyncPage onBack={() => navigateToPage('dashboard')} />
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
    </div>
  )
}

export default App
