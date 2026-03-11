import { forwardRef } from 'react'

const ContentSection = forwardRef(function ContentSection(
    { section, animationDelay, onCardClick },
    ref
) {
    return (
        <section
            className="section"
            id={`${section.id}-section`}
            ref={ref}
            style={{ animationDelay: `${animationDelay}s` }}
        >
            <h2 className={`section-title ${!section.cards.some(c => c.isImplemented) ? 'not-implemented' : ''}`}>
                {section.label}
            </h2>
            <div className="card-grid">
                {section.cards.map((card, cIdx) => (
                    <div
                        className="card"
                        key={cIdx}
                        id={`card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => onCardClick?.(card.title)}
                    >
                        <span className={`card-title ${!card.isImplemented ? 'not-implemented' : ''}`}>
                            {card.title}
                        </span>
                        <card.icon />
                    </div>
                ))}
            </div>
        </section>
    )
})

export default ContentSection
