import { useState, useEffect } from 'react'
import { ChevronDownIcon, CheckIcon } from './icons'

/* ===== Generic Custom Select Dropdown ===== */
function CustomSelect({ options, value, placeholder, onChange, renderOption, hideNone }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.org-custom-select')) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`org-custom-select ${isOpen ? 'open' : ''}`}>
            <div className="org-custom-select-trigger" onClick={() => setIsOpen(!isOpen)}>
                {selectedOption ? (
                    <span className="org-custom-select-value">{selectedOption.label}</span>
                ) : (
                    <span className="org-custom-select-placeholder">{placeholder || 'Select option'}</span>
                )}
                <ChevronDownIcon open={isOpen} />
            </div>

            {isOpen && (
                <div className="org-custom-select-dropdown">
                    {!hideNone && (
                        <div
                            className={`org-custom-select-option ${value === '' ? 'selected' : ''}`}
                            onClick={() => { onChange(''); setIsOpen(false) }}
                        >
                            <div className="org-custom-select-option-header">
                                <span className="org-custom-select-option-title">None (Unassigned)</span>
                                <span className="org-custom-select-check"><CheckIcon /></span>
                            </div>
                        </div>
                    )}

                    {options.map(opt => {
                        const isSelected = value === opt.value;
                        return (
                            <div
                                key={opt.value}
                                className={`org-custom-select-option ${isSelected ? 'selected' : ''}`}
                                onClick={() => { onChange(opt.value); setIsOpen(false) }}
                            >
                                <div className="org-custom-select-option-header">
                                    <span className="org-custom-select-option-title">{opt.label}</span>
                                    <span className="org-custom-select-check"><CheckIcon /></span>
                                </div>
                                {renderOption && renderOption(opt)}
                            </div>
                        )
                    })}

                    {options.length === 0 && (
                        <div className="org-custom-select-empty">No options found</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default CustomSelect
