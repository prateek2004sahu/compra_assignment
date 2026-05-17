import React, { useState } from 'react';

export default function JsonPanel({ designJson }) {
  const [copied, setCopied] = useState(false);
  const jsonStr = JSON.stringify(designJson, null, 2);

  const copy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--surface)',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 18px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--accent)',
          letterSpacing: 1,
          fontWeight: 600,
        }}>
          DESIGN JSON
        </span>
        <button onClick={copy} style={{
          background: copied ? '#22c55e22' : 'transparent',
          border: `1px solid ${copied ? '#22c55e' : 'var(--border)'}`,
          color: copied ? '#22c55e' : 'var(--muted)',
          padding: '4px 12px',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          transition: 'all 0.2s',
        }}>
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>

      {/* JSON Content */}
      <pre style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px 18px',
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        color: '#a8b4d8',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        margin: 0,
      }}>
        {jsonStr}
      </pre>
    </div>
  );
}