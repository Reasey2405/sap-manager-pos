import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import sections from './data/sections'
import Navbar from './components/Navbar'
import ContentSection from './components/ContentSection'
import MonitoringPage from './components/MonitoringPage'
import './components/MonitoringPage.css'

/* ===== App Component ===== */
function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sap-theme')
    return saved || 'dark'
  })
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard') // 'dashboard' or 'monitoring'
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

  /* Navigate to section on nav click */
  const scrollToSection = (sectionId) => {
    // If on a sub-page, go back to dashboard first
    if (currentPage !== 'dashboard') {
      setCurrentPage('dashboard')
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
      setCurrentPage('monitoring')
      window.scrollTo(0, 0)
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
        <MonitoringPage onBack={() => setCurrentPage('dashboard')} />
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
