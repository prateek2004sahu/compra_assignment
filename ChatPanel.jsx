import React, { useState, useRef, useEffect } from 'react';
import { buildSystemPrompt } from '../utils/layoutHelpers.js';

function extractJSON(text) {
  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch {}

  // Strip markdown fences
  const stripped = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {}

  // Find first { to last }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {}
  }

  return null;
}

export default function ChatPanel({ designJson, onUpdate }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your layout agent. Describe a change — like \"Convert to 9:16\", \"Move the headline to the top\", or \"Make the offer badge larger\".",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const designRef = useRef(designJson);
  designRef.current = designJson;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      const systemPrompt = buildSystemPrompt(designRef.current);

      const apiMessages = newMessages
        .filter((_, i) => i > 0)
        .map(m => ({ role: m.role, content: m.content }));

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: systemPrompt,
          messages: apiMessages,
        }),
      });

      const data = await resp.json();

      // Handle API errors
      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `API Error: ${data.error.message}`,
        }]);
        setLoading(false);
        return;
      }

      const rawText = data.content?.[0]?.text || '';
      console.log('Raw API response:', rawText);

      // Try to extract JSON from response
      const parsed = extractJSON(rawText);

      if (parsed && parsed.nodes && parsed.rootNodes) {
        // Valid design JSON — update layout
        onUpdate(parsed);
        // Extract any comment lines as the reply message
        const commentLines = rawText
          .split('\n')
          .filter(l => l.startsWith('//'))
          .map(l => l.replace('//', '').trim())
          .join(' ');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: commentLines || 'Layout updated! ✓',
          updated: true,
        }]);
      } else {
        // No valid JSON found — show text reply
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: rawText || 'No response received.',
        }]);
      }

    } catch (err) {
      console.error('Error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
      }]);
    }

    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    'Convert this design to 9:16',
    'Move the headline to the top',
    'Make the headline smaller',
    'Move the offer badge higher',
    'Keep the product large',
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg)',
    }}>

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <h1 style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.5, color: 'var(--text)' }}>
          Layout Agent
        </h1>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
          powered by claude-sonnet-4
        </p>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '85%',
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface)',
              color: 'var(--text)',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              fontSize: 13.5,
              lineHeight: 1.5,
              border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
            }}>
              {msg.updated && (
                <div style={{
                  background: '#22c55e22',
                  color: '#22c55e',
                  fontSize: 10,
                  padding: '1px 6px',
                  borderRadius: 3,
                  marginBottom: 6,
                  fontFamily: 'var(--font-mono)',
                  display: 'inline-block',
                }}>
                  ✓ JSON UPDATED
                </div>
              )}
              <div>{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px 16px 16px 4px',
              padding: '12px 16px',
              display: 'flex',
              gap: 5,
              alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div style={{ padding: '0 20px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s)} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              padding: '5px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontFamily: 'var(--font-ui)',
              cursor: 'pointer',
            }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)'; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '12px 20px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Describe a layout change..."
          rows={2}
          style={{
            flex: 1,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            color: 'var(--text)',
            fontSize: 13.5,
            padding: '10px 14px',
            resize: 'none',
            fontFamily: 'var(--font-ui)',
            outline: 'none',
            lineHeight: 1.4,
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? 'var(--border)' : 'var(--accent)',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            width: 42,
            height: 42,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ↑
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}