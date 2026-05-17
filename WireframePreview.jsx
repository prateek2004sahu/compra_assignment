import React, { useMemo } from 'react';

const ROLE_COLORS = {
  background: '#1a2a1a',
  product: '#1e3a5f',
  headline: '#3a2a5a',
  offer_badge: '#5a3a00',
  cta: '#3a1a1a',
  social_proof: '#1a3a3a',
  decoration: '#2a2a3a',
  text: '#2a2a4a',
  shape: '#5a3a00',
  image: '#2a2a3a',
};

function getRole(node) {
  if (!node) return 'text';
  const name = (node.name || '').toLowerCase();
  const content = (node.data?.content || '').toLowerCase();
  if (name.includes('background')) return 'background';
  if (name.includes('product')) return 'product';
  if (content.includes('luxury') || content.includes('surprisingly')) return 'headline';
  if (content.includes('comfort that defines')) return 'subheadline';
  if (content.includes('off') || node.data?.shapeType === 'circle') return 'offer_badge';
  if (content.includes('limited')) return 'cta';
  if (content.includes('homes')) return 'social_proof';
  if (node.type === 'image') return 'decoration';
  return node.type || 'text';
}

export default function WireframePreview({ designJson }) {
  const artboard = useMemo(() => {
    if (!designJson?.nodes) return null;
    return Object.values(designJson.nodes).find(n => n.type === 'artboard');
  }, [designJson]);

  if (!artboard) return (
    <div style={{ color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
      No artboard found
    </div>
  );

  const PREVIEW_WIDTH = 220;
  const scale = PREVIEW_WIDTH / artboard.width;
  const previewH = artboard.height * scale;

  const children = (artboard.children || [])
    .map(id => designJson.nodes[id])
    .filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <p style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
        {artboard.width} × {artboard.height}
      </p>
      <div style={{
        position: 'relative',
        width: PREVIEW_WIDTH,
        height: previewH,
        background: '#0a0a0a',
        border: '1px solid var(--border)',
        borderRadius: 6,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {children.map(node => {
          const role = getRole(node);
          const x = node.x * scale;
          const y = node.y * scale;
          const w = Math.max(node.width * scale, 3);
          const h = Math.max(node.height * scale, 3);
          const color = ROLE_COLORS[role] || '#2a2a3a';
          const isCircle = node.data?.shapeType === 'circle';
          const isText = node.type === 'text';
          const isBackground = role === 'background';

          return (
            <div
              key={node.id}
              title={`${node.name}: ${node.data?.content || role}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: w,
                height: h,
                background: isBackground
                  ? 'linear-gradient(135deg, #1a3a2a 0%, #0d1a10 100%)'
                  : color,
                borderRadius: isCircle ? '50%' : 2,
                border: isBackground ? 'none' : `1px solid ${color}cc`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {isText && w > 25 && h > 6 && (
                <span style={{
                  fontSize: Math.max(4, (node.style?.visual?.fontSize || 14) * scale * 0.55),
                  color: '#ffffff66',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  padding: '0 2px',
                  pointerEvents: 'none',
                }}>
                  {(node.data?.content || '').replace(/\n/g, ' ').slice(0, 18)}
                </span>
              )}
              {role === 'product' && w > 30 && (
                <span style={{ fontSize: 7, color: '#ffffff44', fontFamily: 'var(--font-mono)' }}>
                  PRODUCT
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 220 }}>
        {[
          { role: 'background', label: 'BG' },
          { role: 'product', label: 'Product' },
          { role: 'headline', label: 'Headline' },
          { role: 'offer_badge', label: 'Badge' },
          { role: 'cta', label: 'CTA' },
        ].map(({ role, label }) => (
          <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: ROLE_COLORS[role] || '#333' }} />
            <span style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}