import React from 'react';
import {
    Activity,
    Check,
    ChevronRight,
    Heart,
    Settings
} from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard/ServiceCard';
import './Forms.css'; // Reusing form styles

export const DesignSystem: React.FC = () => {

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className="page-header">
                <div className="header-text">
                    <h2>Design System</h2>
                    <p className="page-subtitle">UI Style Guide & Component Library</p>
                </div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                {/* 1. Colors */}
                <section>
                    <h3 className="section-title">Colors</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                        <ColorSwatch name="Primary" varName="--color-primary" />
                        <ColorSwatch name="Secondary" varName="--color-secondary" />
                        <ColorSwatch name="Success" varName="--color-success" />
                        <ColorSwatch name="Warning" varName="--color-warning" />
                        <ColorSwatch name="Error" varName="--color-error" />
                        <ColorSwatch name="Info" varName="--color-info" />
                        <ColorSwatch name="Text" varName="--color-text" />
                        <ColorSwatch name="Text Muted" varName="--color-text-muted" />
                        <ColorSwatch name="Border" varName="--color-border" />
                        <ColorSwatch name="Surface" varName="--color-surface" />
                        <ColorSwatch name="Background" varName="--color-background" />
                    </div>
                </section>

                {/* 2. Typography */}
                <section>
                    <h3 className="section-title">Typography</h3>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <h1>Heading 1 (2rem)</h1>
                            <p className="page-subtitle">Subtitle / Caption text</p>
                        </div>
                        <div>
                            <h2>Heading 2 (1.5rem)</h2>
                            <p>Standard paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        </div>
                        <div>
                            <h3>Heading 3 (1.25rem)</h3>
                            <p className="form-date">Small / Metadata text (0.8rem)</p>
                        </div>
                    </div>
                </section>

                {/* 3. Buttons */}
                <section>
                    <h3 className="section-title">Buttons</h3>
                    <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                        <button className="btn-primary">
                            Primary Button
                        </button>
                        <button className="btn-primary">
                            {/* <Video size={18} /> */}
                            With Icon
                        </button>
                        <button className="btn-secondary">
                            Secondary Button
                        </button>
                        <button className="icon-btn" style={{ border: '1px solid var(--color-border)' }}>
                            <Settings size={20} />
                        </button>
                        <button className="back-btn-circle">
                            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                        <button className="view-all-link">
                            Link Button <ChevronRight size={16} />
                        </button>
                    </div>
                </section>

                {/* 4. Badges */}
                <section>
                    <h3 className="section-title">Badges & Status</h3>
                    <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        <span className="status-badge upcoming">Upcoming</span>
                        <span className="status-badge completed">Completed</span>
                        <span className="status-badge cancelled">Cancelled</span>
                        <span className="badge success"><Check size={12} /> Success</span>
                        <span className="badge warning">Warning</span>
                        <span className="badge draft">Draft</span>
                        <span className="nav-badge-overlay" style={{ position: 'static' }}>3</span>
                    </div>
                </section>

                {/* 5. Components */}
                <section>
                    <h3 className="section-title">Components</h3>
                    <div className="hub-grid" style={{ marginBottom: '2rem' }}>
                        <ServiceCard
                            title="Service Card"
                            description="Standard navigation card component."
                            icon={<Activity size={24} />}
                            onClick={() => { }}
                            actionLabel="Action"
                            colorTheme="primary"
                        />
                        <ServiceCard
                            title="With Badge"
                            description="Card showing a notification badge."
                            icon={<Heart size={24} />}
                            onClick={() => { }}
                            actionLabel="View"
                            colorTheme="purple"
                            badge={5}
                        />
                    </div>
                </section>

                {/* 6. Forms */}
                <section>
                    <h3 className="section-title">Form Elements</h3>
                    <div className="card" style={{ maxWidth: '600px' }}>
                        <div className="form-content">
                            <div className="form-field">
                                <label>Text Input</label>
                                <input type="text" placeholder="Enter text..." />
                            </div>
                            <div className="form-field">
                                <label>Select Input</label>
                                <select>
                                    <option>Option 1</option>
                                    <option>Option 2</option>
                                    <option>Option 3</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Textarea</label>
                                <textarea rows={3} placeholder="Enter description..."></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input type="checkbox" id="check1" />
                                <label htmlFor="check1" style={{ margin: 0 }}>Checkbox option</label>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

const ColorSwatch = ({ name, varName }: { name: string, varName: string }) => (
    <div style={{
        background: 'var(--color-surface)',
        padding: '1rem',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    }}>
        <div style={{
            height: '60px',
            borderRadius: 'var(--radius)',
            background: `var(${varName})`,
            border: '1px solid rgba(0,0,0,0.1)'
        }} />
        <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{varName}</div>
        </div>
    </div>
);
