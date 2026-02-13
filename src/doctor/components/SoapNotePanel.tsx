import { useState } from 'react';
import {
  Sparkles,
  FileSignature,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Save,
  Loader2,
  Eye,
} from 'lucide-react';

// AI-generated content uses a special delimiter (⌁AI⌁) that we detect for subtle styling
const AI_DELIMITER = '⌁AI⌁';

type SoapSection = 'S' | 'O' | 'A' | 'P';
const LABELS: Record<SoapSection, string> = { S: 'Subjective', O: 'Objective', A: 'Assessment', P: 'Plan' };
const FIELDS: Record<SoapSection, 'subjective' | 'objective' | 'assessment' | 'plan'> = {
  S: 'subjective', O: 'objective', A: 'assessment', P: 'plan',
};

export interface SoapData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface SoapNotePanelProps {
  /** compact = true for teleconsult cramped layout */
  compact?: boolean;

  /** SOAP field values */
  soapData: SoapData;
  /** Called when a SOAP field changes */
  onSoapChange: (field: keyof SoapData, value: string) => void;

  /** Note status */
  status: string;
  /** ICD-10 codes (optional, shown if present) */
  icdCodes?: string[];
  /** Whether note was AI-assisted */
  aiAssisted?: boolean;

  /** AI feature flags & state */
  hasAI?: boolean;
  aiGenerated?: boolean;
  aiProcessing?: boolean;
  isRecording?: boolean;
  recordingSeconds?: number;
  transcriptLinesCount?: number;
  onGenerateSoap?: () => void;

  /** Actions */
  onSaveDraft: () => void;
  onSignNote: () => void;
  onViewSignedCopy?: () => void;

  /** CDSS */
  activeAlertsCount?: number;

  /** Draft saved time */
  lastSaved?: string | null;

  /** Recording time formatter (provided by parent) */
  formatTime?: (sec: number) => string;
}

const defaultFormatTime = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

// ── Style factory: returns sizing based on compact flag ──
const getStyles = (compact: boolean) => ({
  panel: {
    background: 'var(--color-surface)',
    borderRadius: compact ? 10 : 14,
    padding: compact ? '14px' : '20px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border, #e2e8f0)',
    flex: 1,
  } as React.CSSProperties,
  soapCard: {
    background: 'var(--color-surface)',
    borderRadius: compact ? 8 : 12,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border, #e2e8f0)',
    overflow: 'hidden',
    marginBottom: compact ? 10 : 14,
  } as React.CSSProperties,
  soapCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: compact ? '10px 12px' : '14px 16px',
    background: 'var(--color-background)',
    borderBottom: '1px solid var(--color-border)',
    cursor: 'pointer',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    minHeight: compact ? 60 : 100,
    border: '1px solid var(--color-border)',
    borderRadius: compact ? 8 : 10,
    padding: compact ? '8px 10px' : '12px 14px',
    fontSize: compact ? 13 : 14,
    fontFamily: 'inherit',
    lineHeight: 1.6,
    color: 'var(--color-text)',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  letterBase: (bg: string): React.CSSProperties => ({
    width: compact ? 20 : 24,
    height: compact ? 20 : 24,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: compact ? 11 : 13,
    fontWeight: 700,
    color: 'white',
    background: bg,
    flexShrink: 0,
  }),
  aiBadge: {
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 4,
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  } as React.CSSProperties,
  icdChip: {
    padding: '4px 10px',
    borderRadius: 6,
    background: 'rgba(139, 92, 246, 0.08)',
    fontSize: 12,
    fontWeight: 600,
    color: '#8b5cf6',
  } as React.CSSProperties,
  btnPrimary: {
    flex: compact ? undefined : 1,
    minWidth: compact ? undefined : 120,
    padding: compact ? '10px 14px' : '14px 18px',
    borderRadius: compact ? 8 : 12,
    border: 'none',
    background: 'var(--color-primary)',
    color: 'white',
    fontSize: compact ? 13 : 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  } as React.CSSProperties,
  btnSecondary: {
    padding: compact ? '10px 14px' : '14px 18px',
    borderRadius: compact ? 8 : 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: compact ? 13 : 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  } as React.CSSProperties,
});

const LETTER_COLORS: Record<SoapSection, string> = {
  S: '#3b82f6',
  O: '#10b981',
  A: '#f59e0b',
  P: '#8b5cf6',
};

export const SoapNotePanel: React.FC<SoapNotePanelProps> = ({
  compact = false,
  soapData,
  onSoapChange,
  status,
  icdCodes,
  aiAssisted,
  hasAI = false,
  aiGenerated = false,
  aiProcessing = false,
  isRecording = false,
  recordingSeconds = 0,
  transcriptLinesCount = 0,
  onGenerateSoap,
  onSaveDraft,
  onSignNote,
  onViewSignedCopy,
  activeAlertsCount = 0,
  lastSaved,
  formatTime = defaultFormatTime,
}) => {
  const s = getStyles(compact);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    S: true, O: true, A: true, P: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isSigned = status === 'Signed';

  return (
    <div style={s.panel}>
      {/* Recording banner inside SOAP — doctor can write while AI listens */}
      {isRecording && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: compact ? '6px 10px' : '8px 12px',
          marginBottom: compact ? 10 : 14, borderRadius: 8,
          background: 'rgba(239, 68, 68, 0.06)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          fontSize: compact ? 11 : 12,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-error)', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
          <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>
            AI transcribing — {formatTime(recordingSeconds)}
          </span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
            · {transcriptLinesCount} lines · You can write notes below
          </span>
        </div>
      )}

      {/* AI append notification */}
      {aiGenerated && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: compact ? '8px 10px' : '10px 14px',
          marginBottom: compact ? 10 : 14, borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06), rgba(99, 102, 241, 0.06))',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          fontSize: compact ? 12 : 13,
        }}>
          <Sparkles size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
          <span style={{ color: '#6d28d9', fontWeight: 600 }}>AI notes appended</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: compact ? 11 : 12 }}>
            — highlighted with a purple accent. AI markers are removed when you sign.
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: compact ? 10 : 16,
      }}>
        <span style={{ fontSize: compact ? 13 : 15, fontWeight: 700 }}>SOAP Note</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {aiAssisted && (
            <span style={s.aiBadge}>
              <Sparkles size={8} /> AI Assisted
            </span>
          )}
          {lastSaved && (
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
              Saved {lastSaved}
            </span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 6,
            background: isSigned ? 'rgba(16,185,129,0.1)' : 'var(--color-background)',
            color: isSigned ? 'var(--color-success)' : 'var(--color-text-muted)',
            textTransform: 'uppercase',
          }}>
            {status || 'Draft'}
          </span>
        </div>
      </div>

      {/* SOAP Sections */}
      {(['S', 'O', 'A', 'P'] as SoapSection[]).map((letter) => {
        const isExpanded = expandedSections[letter];
        const value = soapData[FIELDS[letter]];
        const hasAiContent = value.includes(AI_DELIMITER);
        const aiParts = hasAiContent ? value.split(AI_DELIMITER) : [value];
        const manualPart = aiParts[0];
        const aiPart = aiParts.length > 1 ? aiParts.slice(1).join('') : '';

        return (
          <div key={letter} style={s.soapCard}>
            <div style={s.soapCardHeader} onClick={() => toggleSection(letter)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={s.letterBase(LETTER_COLORS[letter])}>{letter}</span>
                <span style={{ fontSize: compact ? 12 : 13, fontWeight: 700, textTransform: 'uppercase' }}>
                  {LABELS[letter]}
                </span>
                {hasAiContent && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white',
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}>
                    <Sparkles size={8} /> AI
                  </span>
                )}
                {compact && value.length > 0 && (
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{value.length}</span>
                )}
              </div>
              {isExpanded ? <ChevronUp size={compact ? 14 : 16} /> : <ChevronDown size={compact ? 14 : 16} />}
            </div>
            {isExpanded && (
              <div style={{ padding: compact ? '10px 12px' : '14px 16px' }}>
                {hasAiContent ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {/* Manual content — editable */}
                    <textarea
                      style={{ ...s.textarea, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
                      value={manualPart}
                      onChange={(e) => onSoapChange(FIELDS[letter], e.target.value + AI_DELIMITER + aiPart)}
                      rows={Math.max(compact ? 2 : 2, manualPart.split('\n').length)}
                    />
                    {/* AI content — editable but with subtle accent */}
                    <div style={{
                      borderLeft: '3px solid #8b5cf6',
                      background: 'rgba(139, 92, 246, 0.04)',
                      borderRadius: '0 0 10px 10px',
                      border: '1px solid var(--color-border)',
                      borderTop: '1px dashed rgba(139, 92, 246, 0.3)',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: compact ? '4px 10px' : '6px 12px',
                        background: 'rgba(139, 92, 246, 0.06)',
                        borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
                        fontSize: compact ? 9 : 10, fontWeight: 600, color: '#7c3aed',
                      }}>
                        <Sparkles size={10} /> AI-generated from transcript — will be merged on sign
                      </div>
                      <textarea
                        style={{
                          ...s.textarea,
                          borderRadius: '0 0 10px 10px',
                          border: 'none',
                          borderLeft: '3px solid #8b5cf6',
                          background: 'rgba(139, 92, 246, 0.02)',
                        }}
                        value={aiPart}
                        onChange={(e) => onSoapChange(FIELDS[letter], manualPart + AI_DELIMITER + e.target.value)}
                        rows={Math.max(compact ? 2 : 2, aiPart.split('\n').length)}
                      />
                    </div>
                  </div>
                ) : (
                  <textarea
                    style={s.textarea}
                    value={value}
                    onChange={(e) => onSoapChange(FIELDS[letter], e.target.value)}
                    placeholder={`Enter ${LABELS[letter].toLowerCase()}...`}
                    rows={compact ? (value.length > 200 ? 5 : 2) : (letter === 'P' ? 6 : 4)}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ICD-10 Codes */}
      {(icdCodes?.length ?? 0) > 0 && (
        <div style={{ marginBottom: compact ? 10 : 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>ICD-10 Codes</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {icdCodes!.map((code) => (
              <span key={code} style={s.icdChip}>{code}</span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {isSigned ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: compact ? 10 : 14, borderRadius: compact ? 8 : 12,
            background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)',
            color: 'var(--color-success)', fontWeight: 600, fontSize: compact ? 13 : 14,
          }}>
            <CheckCircle2 size={compact ? 16 : 18} /> Note Signed
          </div>
          {onViewSignedCopy && (
            <button style={{ ...s.btnSecondary, width: '100%', justifyContent: 'center' }} onClick={onViewSignedCopy}>
              <Eye size={16} /> View Signed Copy
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: compact ? 6 : 10, flexWrap: 'wrap' }}>
          {hasAI && !aiGenerated && onGenerateSoap && (
            <button
              style={{
                ...s.btnSecondary,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(99,102,241,0.06))',
                borderColor: 'rgba(139,92,246,0.2)', color: '#7c3aed',
                opacity: aiProcessing ? 0.7 : 1,
              }}
              onClick={onGenerateSoap}
              disabled={aiProcessing}
            >
              {aiProcessing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
              {compact ? (aiProcessing ? 'AI...' : 'AI Generate') : (aiProcessing ? 'Generating...' : 'Generate from AI')}
            </button>
          )}
          <button style={s.btnSecondary} onClick={onSaveDraft}>
            <Save size={14} /> {compact ? 'Save' : 'Save Draft'}
          </button>
          <button style={{ ...s.btnPrimary, flex: 1 }} onClick={onSignNote}>
            <FileSignature size={compact ? 14 : 16} /> Sign Note
            {activeAlertsCount > 0 && (
              <span style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 8,
                background: 'rgba(255,255,255,0.2)', fontWeight: 700,
              }}>
                {activeAlertsCount} alert{activeAlertsCount > 1 ? 's' : ''}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
