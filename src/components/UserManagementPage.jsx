import { useState, useEffect, useCallback } from 'react'

import { API_BASE, fetchJSON, postJSON, patchJSON } from '../service/api'
import { UsersIcon } from './Icons'
import './UserManagementPage.css'

/* ===== Local Icons ===== */
const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
)

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
)

const SaveIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
)

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const ChevronDownIcon = ({ open }) => (
    <svg
        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={`org-chevron ${open ? 'open' : ''}`}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

const MailIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
)

const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
)

const KeyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
)


/* ===== Generic Custom Select Dropdown ===== */
function CustomSelect({ options, value, placeholder, onChange }) {
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
                    <div
                        className={`org-custom-select-option ${value === '' ? 'selected' : ''}`}
                        onClick={() => { onChange(''); setIsOpen(false) }}
                    >
                        <div className="org-custom-select-option-header">
                            <span className="org-custom-select-option-title">Select option...</span>
                        </div>
                    </div>

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
                                    {isSelected && <span className="org-custom-select-check"><CheckIcon /></span>}
                                </div>
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

/* ===== Form Field ===== */
function FormField({ label, children, required }) {
    return (
        <div className="org-form-field">
            <label className="org-form-label">
                {label} {required && <span className="org-form-required">*</span>}
            </label>
            {children}
        </div>
    )
}

/* ===== Loading Spinner ===== */
function LoadingSpinner({ text }) {
    return (
        <div className="org-loading">
            <div className="org-spinner" />
            <span>{text || 'Loading...'}</span>
        </div>
    )
}

/* ===== Add User Modal ===== */
function AddUserModal({ roles, onSubmit, onClose }) {
    const [form, setForm] = useState({
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        role: '',
        email: '',
        phone: '',
        active: true,
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const updateField = (field, value) => {
        setForm(f => ({ ...f, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.username || !form.password || !form.role) {
            setError('Username, Password, and Role are required')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await onSubmit({ ...form })
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="org-modal-overlay" onClick={onClose}>
            <div className="org-modal" onClick={e => e.stopPropagation()}>
                <div className="org-modal-header">
                    <div className="org-modal-title-row">
                        <UsersIcon />
                        <h3 className="org-modal-title">Create New User</h3>
                    </div>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>

                <form onSubmit={handleSubmit} className="org-modal-body">
                    {error && <div className="org-form-error">{error}</div>}

                    <div className="org-form-grid">
                        <FormField label="Username" required>
                            <input type="text" className="org-form-input" value={form.username}
                                onChange={e => updateField('username', e.target.value)} placeholder="e.g. jdoe" />
                        </FormField>

                        <FormField label="Password" required>
                            <input type="password" className="org-form-input" value={form.password}
                                onChange={e => updateField('password', e.target.value)} placeholder="Password" />
                        </FormField>
                    </div>

                    <div className="org-form-grid">
                        <FormField label="First Name">
                            <input type="text" className="org-form-input" value={form.firstName}
                                onChange={e => updateField('firstName', e.target.value)} placeholder="John" />
                        </FormField>
                        <FormField label="Last Name">
                            <input type="text" className="org-form-input" value={form.lastName}
                                onChange={e => updateField('lastName', e.target.value)} placeholder="Doe" />
                        </FormField>
                    </div>

                    <div className="org-form-grid">
                        <FormField label="Email">
                            <input type="email" className="org-form-input" value={form.email}
                                onChange={e => updateField('email', e.target.value)} placeholder="john@example.com" />
                        </FormField>
                        <FormField label="Phone">
                            <input type="tel" className="org-form-input" value={form.phone}
                                onChange={e => updateField('phone', e.target.value)} placeholder="+1234567890" />
                        </FormField>
                    </div>

                    <FormField label="Role" required>
                        <CustomSelect
                            options={roles.map(r => ({ value: r.roleCode, label: r.roleName || r.roleCode }))}
                            value={form.role}
                            placeholder="Select role"
                            onChange={v => updateField('role', v)}
                        />
                    </FormField>

                    <div className="org-form-field org-checkbox-field" style={{ marginTop: '12px' }}>
                        <label className="org-checkbox-label">
                            <input type="checkbox" checked={form.active} onChange={e => updateField('active', e.target.checked)} />
                            <span>Active account</span>
                        </label>
                    </div>

                    <div className="org-modal-actions">
                        <button type="button" className="toolbar-btn" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="toolbar-btn primary" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ===== Reset Password Modal ===== */
function ResetPasswordModal({ username, onSubmit, onClose }) {
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!oldPassword || !newPassword) {
            setError('Both passwords are required')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await onSubmit(username, oldPassword, newPassword)
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="org-modal-overlay" onClick={onClose}>
            <div className="org-modal password-reset-modal" onClick={e => e.stopPropagation()}>
                <div className="org-modal-header">
                    <div className="org-modal-title-row">
                        <KeyIcon />
                        <h3 className="org-modal-title">Reset Password</h3>
                    </div>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="org-modal-body">
                    {error && <div className="org-form-error">{error}</div>}
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Resetting password for user <strong>{username}</strong>.
                    </p>
                    <FormField label="Manager Old Password" required>
                        <input type="password" className="org-form-input" value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)} />
                    </FormField>
                    <FormField label="User New Password" required>
                        <input type="password" className="org-form-input" value={newPassword}
                            onChange={e => setNewPassword(e.target.value)} />
                    </FormField>
                    <div className="org-modal-actions">
                        <button type="button" className="toolbar-btn" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="toolbar-btn primary" disabled={submitting}>
                            {submitting ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}


/* ===== User Detail / Edit Panel ===== */
function UserDetailPanel({ user, roles, onClose, onUpdate, onResetPassword }) {
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState('')
    const [form, setForm] = useState({})

    const [posGroups, setPosGroups] = useState([])
    const [loadingPosGroups, setLoadingPosGroups] = useState(false)

    const fetchPosGroups = async (username) => {
        setLoadingPosGroups(true)
        try {
            const groups = await fetchJSON(`${API_BASE}/api/pos_terminal/get-user-pos-groups?username=${username}`)
            setPosGroups(groups || [])
        } catch (err) {
            console.error("Failed to load POS groups", err)
        } finally {
            setLoadingPosGroups(false)
        }
    }

    useEffect(() => {
        setEditing(false)
        setSaveMsg('')
        setForm({ ...user })
        if (user?.username) {
            fetchPosGroups(user.username)
        }
    }, [user])

    if (!user) return null

    const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }))

    const handleSave = async () => {
        setSaving(true)
        setSaveMsg('')
        try {
            await patchJSON(`${API_BASE}/api/auth/users/${user.username}`, {
                username: form.username,
                role: form.role || null,
                firstName: form.firstName || null,
                lastName: form.lastName || null,
                email: form.email || null,
                phone: form.phone || null,
                profilePictureUrl: form.profilePictureUrl || null,
                companyId: form.companyId ? parseInt(form.companyId) : null,
                companyName: form.companyName || null,
                department: form.department || null,
            })

            const assignedCodes = posGroups.filter(g => g.assigned).map(g => g.groupCode)
            await postJSON(`${API_BASE}/api/pos_terminal/assign-pos-groups?username=${user.username}`, assignedCodes)

            setSaveMsg('Saved successfully')
            setEditing(false)
            if (onUpdate) onUpdate()

            fetchPosGroups(user.username)
        } catch (err) {
            setSaveMsg('Error: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setForm({ ...user })
        setEditing(false)
        setSaveMsg('')
        if (user?.username) {
            fetchPosGroups(user.username)
        }
    }

    const renderValue = (label, value) => (
        <div className="org-setting-row">
            <span className="org-setting-label">{label}</span>
            <span className="org-setting-value">{value === null || value === undefined || value === '' ? '—' : String(value)}</span>
        </div>
    )

    return (
        <div className="org-settings-panel">
            <div className="org-settings-panel-header">
                <div className="org-settings-panel-title-row">
                    <div className="user-avatar-placeholder" style={{ width: 32, height: 32, fontSize: 13 }}>
                        {(user.firstName?.[0] || user.username?.[0] || '?').toUpperCase()}
                    </div>
                    <h3 className="org-settings-panel-title">{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username}</h3>
                </div>
                <div className="org-settings-header-actions">
                    {!editing ? (
                        <button className="org-settings-edit-btn" onClick={() => setEditing(true)} title="Edit"><EditIcon /></button>
                    ) : (
                        <>
                            <button className="org-settings-save-btn" onClick={handleSave} disabled={saving} title="Save"><SaveIcon /></button>
                            <button className="org-settings-cancel-btn" onClick={handleCancel} disabled={saving} title="Cancel"><CloseIcon /></button>
                        </>
                    )}
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
            </div>

            {saveMsg && <div className={`org-save-msg ${saveMsg.startsWith('Error') ? 'error' : 'success'}`}>{saveMsg}</div>}

            {!editing ? (
                <>
                    <div className="org-settings-info-grid">
                        <div className="org-settings-info-item">
                            <span className="org-settings-info-label">Username</span>
                            <span className="org-settings-info-value mono">{user.username}</span>
                        </div>
                        <div className="org-settings-info-item">
                            <span className="org-settings-info-label">Role</span>
                            <span className="user-role-badge" style={{ marginTop: '4px' }}>{user.role || '—'}</span>
                        </div>
                    </div>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Contact Information</h4>
                    <div className="org-settings-list">
                        {renderValue('First Name', user.firstName)}
                        {renderValue('Last Name', user.lastName)}
                        {renderValue('Email', user.email)}
                        {renderValue('Phone', user.phone)}
                    </div>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Organization</h4>
                    <div className="org-settings-list">
                        {renderValue('Company ID', user.companyId)}
                        {renderValue('Company Name', user.companyName)}
                        {renderValue('Department', user.department)}
                    </div>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Security Settings</h4>
                    <div className="user-actions-row">
                        <button className="btn-reset-password" onClick={() => onResetPassword(user.username)}>
                            Reset Password
                        </button>
                    </div>

                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">POS Access</h4>
                    {loadingPosGroups ? (
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading POS groups...</div>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {posGroups.filter(g => g.assigned).length > 0 ? (
                                posGroups.filter(g => g.assigned).map(g => (
                                    <div key={g.groupCode} className="user-role-badge">
                                        {g.groupName || g.groupCode}
                                    </div>
                                ))
                            ) : (
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No POS groups assigned</div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="org-settings-edit-form">
                    <FormField label="Username">
                        <input className="org-form-input" value={form.username || ''} disabled />
                    </FormField>

                    <h4 className="org-settings-section-title">Details</h4>
                    <div className="org-form-grid" style={{ marginBottom: 16 }}>
                        <FormField label="First Name">
                            <input className="org-form-input" value={form.firstName || ''} onChange={e => updateField('firstName', e.target.value)} />
                        </FormField>
                        <FormField label="Last Name">
                            <input className="org-form-input" value={form.lastName || ''} onChange={e => updateField('lastName', e.target.value)} />
                        </FormField>
                    </div>

                    <FormField label="Role">
                        <CustomSelect
                            options={roles.map(r => ({ value: r.roleCode, label: r.roleName || r.roleCode }))}
                            value={form.role || ''}
                            placeholder="Select role"
                            onChange={v => updateField('role', v)}
                        />
                    </FormField>

                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Contact</h4>
                    <FormField label="Email">
                        <input className="org-form-input" type="email" value={form.email || ''} onChange={e => updateField('email', e.target.value)} />
                    </FormField>
                    <FormField label="Phone">
                        <input className="org-form-input" type="tel" value={form.phone || ''} onChange={e => updateField('phone', e.target.value)} />
                    </FormField>

                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Organization</h4>
                    <div className="org-form-grid">
                        <FormField label="Company ID">
                            <input className="org-form-input" type="number" value={form.companyId || ''} onChange={e => updateField('companyId', e.target.value)} />
                        </FormField>
                        <FormField label="Company Name">
                            <input className="org-form-input" value={form.companyName || ''} onChange={e => updateField('companyName', e.target.value)} />
                        </FormField>
                    </div>
                    <FormField label="Department">
                        <input className="org-form-input" value={form.department || ''} onChange={e => updateField('department', e.target.value)} />
                    </FormField>

                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">POS Access</h4>
                    {loadingPosGroups ? (
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading POS groups...</div>
                    ) : (
                        <div className="org-form-grid" style={{ gridTemplateColumns: '1fr', gap: '12px' }}>
                            {posGroups.map(g => (
                                <label key={g.groupCode} className="org-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                                    <input
                                        type="checkbox"
                                        checked={g.assigned}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setPosGroups(prev => prev.map(pg => pg.groupCode === g.groupCode ? { ...pg, assigned: checked } : pg))
                                        }}
                                    />
                                    <span>{g.groupName || g.groupCode}</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>({g.groupCode})</span>
                                </label>
                            ))}
                            {posGroups.length === 0 && (
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No POS groups available</div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

/* ===== User Card ===== */
function UserCard({ user, isSelected, onSelect }) {
    const fullName = user.firstName || user.lastName
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : user.username

    const initials = (user.firstName?.[0] || user.username?.[0] || '?').toUpperCase()

    return (
        <div
            className={`user-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(user)}
        >
            <div className="user-card-header">
                <div className="user-avatar-placeholder">
                    {initials}
                </div>
                <div className="user-card-info">
                    <span className="user-card-name">{fullName}</span>
                    <span className="user-card-username">@{user.username}</span>
                </div>
            </div>

            <span className="user-role-badge">{user.role || 'USER'}</span>

            <div className="user-card-meta">
                {user.email && (
                    <div className="user-card-meta-item">
                        <MailIcon /> <span>{user.email}</span>
                    </div>
                )}
                {user.phone && (
                    <div className="user-card-meta-item">
                        <PhoneIcon /> <span>{user.phone}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ===== Main Application Page ===== */
function UserManagementPage({ onBack }) {
    const [users, setUsers] = useState([])
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    const [selectedUser, setSelectedUser] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [passwordResetUser, setPasswordResetUser] = useState(null) // username string

    const loadData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const [usersRes, rolesRes] = await Promise.all([
                fetchJSON(`${API_BASE}/api/auth/userList`),
                fetchJSON(`${API_BASE}/api/auth/role`).catch(() => []) // Fallback if roles fails
            ])
            setUsers(Array.isArray(usersRes) ? usersRes : [])
            setRoles(Array.isArray(rolesRes) ? rolesRes : [])

            if (selectedUser) {
                const refreshed = (usersRes || []).find(u => u.username === selectedUser.username)
                if (refreshed) setSelectedUser(refreshed)
            }

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [selectedUser])

    useEffect(() => {
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleCreateUser = async (data) => {
        await postJSON(`${API_BASE}/api/auth/createNewUser`, data)
        await loadData()
    }

    const handleResetPassword = async (username, oldPassword, newPassword) => {
        const textResponse = await postJSON(`${API_BASE}/api/auth/reset-password-by-manager/${username}`, {
            oldPassword,
            newPassword
        })
        console.log('Password reset response:', textResponse)
        // If it throws Error, the closest try-catch will handle it.
        // It returns 'true' on success which is handled gracefully by api.js
    }

    const query = searchQuery.toLowerCase()
    const filteredUsers = users.filter(u =>
        (u.username || '').toLowerCase().includes(query) ||
        (u.firstName || '').toLowerCase().includes(query) ||
        (u.lastName || '').toLowerCase().includes(query) ||
        (u.email || '').toLowerCase().includes(query) ||
        (u.role || '').toLowerCase().includes(query)
    )

    return (
        <div className={`org-page ${selectedUser ? 'panel-open' : ''}`}>
            <div className="org-content">
                <div className={`org-main ${selectedUser ? 'with-panel' : ''}`}>
                    {/* Header */}
                    <div className="org-title-section">
                        <button className="back-button" onClick={onBack}>
                            <BackIcon />
                            <span>Back to Dashboard</span>
                        </button>
                        <h2 className="user-page-title">User Management</h2>
                        <p className="org-page-subtitle">Manage system users, roles, and profiles</p>
                    </div>

                    {/* Stats */}
                    <div className="org-summary-stats">
                        <div className="org-stat-card">
                            <span className="org-stat-number">{users.length}</span>
                            <span className="org-stat-label">Total Users</span>
                        </div>
                        <div className="org-stat-card">
                            <span className="org-stat-number">{roles.length}</span>
                            <span className="org-stat-label">Available Roles</span>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="org-toolbar">
                        <div className="org-search-wrapper">
                            <SearchIcon />
                            <input type="text" className="org-search-input" placeholder="Search by name, username, role..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="org-toolbar-actions">
                            <button className="toolbar-btn" onClick={loadData} title="Refresh data">
                                <RefreshIcon /> Refresh
                            </button>
                            <button className="toolbar-btn primary" onClick={() => setShowAddModal(true)}>
                                <PlusIcon /> Create User
                            </button>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="org-error-banner">
                            <span>⚠ {error}</span>
                            <button className="org-error-retry" onClick={loadData}>Retry</button>
                        </div>
                    )}

                    {loading && <LoadingSpinner text="Loading users..." />}

                    {!loading && (
                        <div className="bank-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <UserCard
                                        key={user.username}
                                        user={user}
                                        isSelected={selectedUser?.username === user.username}
                                        onSelect={setSelectedUser}
                                    />
                                ))
                            ) : (
                                <div className="org-empty-state" style={{ gridColumn: '1 / -1' }}>
                                    <UsersIcon />
                                    <p>{searchQuery ? `No users matching "${searchQuery}"` : 'No users found.'}</p>
                                    {!searchQuery && (
                                        <button className="toolbar-btn primary" onClick={() => setShowAddModal(true)}>
                                            <PlusIcon /> Create User
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Side Panel */}
                {selectedUser && (
                    <UserDetailPanel
                        user={selectedUser}
                        roles={roles}
                        onClose={() => setSelectedUser(null)}
                        onUpdate={loadData}
                        onResetPassword={(uname) => setPasswordResetUser(uname)}
                    />
                )}
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddUserModal
                    roles={roles}
                    onSubmit={handleCreateUser}
                    onClose={() => setShowAddModal(false)}
                />
            )}

            {passwordResetUser && (
                <ResetPasswordModal
                    username={passwordResetUser}
                    onSubmit={handleResetPassword}
                    onClose={() => setPasswordResetUser(null)}
                />
            )}
        </div>
    )
}

export default UserManagementPage
