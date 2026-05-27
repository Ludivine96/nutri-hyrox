import React from 'react';

export function MacroRing({ consumed, target, size = 100 }) {
  const pct = Math.min(consumed / (target || 1), 1);
  const r = size * 0.42, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = pct > 1 ? '#ff5c5c' : pct > 0.8 ? '#c8f562' : '#c8f562';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a2a" strokeWidth={size * 0.08} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color}
        strokeWidth={size * 0.08} strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  );
}

export function MacroBar({ name, consumed, target, color }) {
  const pct = Math.min(consumed / (target || 1), 1) * 100;
  const over = consumed > target;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
        <span style={{ color: '#a0a0a0', fontWeight: 500 }}>{name}</span>
        <span style={{ color: over ? '#ff5c5c' : '#f0ede6', fontWeight: 600 }}>
          {consumed}g <span style={{ color: '#555', fontWeight: 400 }}>/ {target}g</span>
        </span>
      </div>
      <div style={{ height: 5, background: '#2a2a2a', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: over ? '#ff5c5c' : color, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export function MacroChip({ value, unit, color }) {
  return (
    <span style={{
      fontSize: 11, padding: '3px 8px', borderRadius: 99,
      background: '#1a1a1a', color: '#a0a0a0', fontWeight: 500,
      border: '1px solid #2a2a2a'
    }}>
      <span style={{ color: color || '#f0ede6' }}>{value}</span> {unit}
    </span>
  );
}

export function Btn({ children, variant = 'primary', size = 'md', onClick, disabled, style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, border: 'none', fontFamily: 'var(--font-body)',
    fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, transition: 'all 0.2s', borderRadius: 12,
    width: '100%', ...style,
  };
  const variants = {
    primary: { background: '#c8f562', color: '#0a0a0a', padding: size === 'sm' ? '8px 14px' : '13px 20px', fontSize: size === 'sm' ? 12 : 14 },
    secondary: { background: '#1a1a1a', color: '#f0ede6', border: '1px solid #2a2a2a', padding: size === 'sm' ? '8px 14px' : '13px 20px', fontSize: size === 'sm' ? 12 : 14 },
    orange: { background: '#f5a623', color: '#0a0a0a', padding: size === 'sm' ? '8px 14px' : '13px 20px', fontSize: size === 'sm' ? 12 : 14 },
    ghost: { background: 'transparent', color: '#a0a0a0', border: '1px solid #2a2a2a', padding: size === 'sm' ? '6px 12px' : '10px 16px', fontSize: size === 'sm' ? 11 : 13, width: 'auto' },
    danger: { background: 'rgba(255,92,92,0.1)', color: '#ff5c5c', border: '1px solid rgba(255,92,92,0.3)', padding: size === 'sm' ? '6px 12px' : '10px 16px', fontSize: size === 'sm' ? 11 : 13, width: 'auto' },
  };
  return <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#111111', border: '1px solid #2a2a2a', borderRadius: 16,
      padding: 14, marginBottom: 10, ...style,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      {children}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 11, color: '#a0a0a0', fontWeight: 500, letterSpacing: '0.5px' }}>{label}</label>}
      {children}
    </div>
  );
}

export function Input({ value, onChange, placeholder, type = 'text', onKeyDown, style = {} }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
      style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10,
        padding: '11px 14px', color: '#f0ede6', fontSize: 14, width: '100%',
        outline: 'none', transition: 'border-color 0.2s', ...style,
      }}
      onFocus={e => e.target.style.borderColor = '#c8f562'}
      onBlur={e => e.target.style.borderColor = '#2a2a2a'}
    />
  );
}

export function Select({ value, onChange, children, style = {} }) {
  return (
    <select value={value} onChange={onChange} style={{
      background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10,
      padding: '11px 14px', color: '#f0ede6', fontSize: 14, width: '100%',
      outline: 'none', appearance: 'none', ...style,
    }}>
      {children}
    </select>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#555', marginBottom: 14, fontFamily: 'var(--font-display)' }}>
      {children}
    </div>
  );
}

export function Alert({ msg, type = 'success' }) {
  if (!msg) return null;
  const colors = { success: { bg: 'rgba(200,245,98,0.1)', border: '#c8f562', color: '#c8f562' }, error: { bg: 'rgba(255,92,92,0.1)', border: '#ff5c5c', color: '#ff5c5c' } };
  const c = colors[type] || colors.success;
  return (
    <div style={{ padding: '11px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12, background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
      {msg}
    </div>
  );
}

export function Spinner({ color = '#0a0a0a' }) {
  return (
    <span style={{
      width: 18, height: 18, border: `2px solid rgba(0,0,0,0.2)`,
      borderTopColor: color, borderRadius: '50%',
      animation: 'spin 0.7s linear infinite', display: 'inline-block',
      style: `@keyframes spin { to { transform: rotate(360deg); } }`
    }} />
  );
}

export function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width: 42, height: 24, borderRadius: 99, background: on ? 'rgba(200,245,98,0.2)' : '#2a2a2a',
      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', width: 18, height: 18, borderRadius: '50%',
        background: on ? '#c8f562' : '#555', top: 3,
        left: on ? 21 : 3, transition: 'left 0.2s, background 0.2s',
      }} />
    </button>
  );
}

export function Tag({ children, color = '#c8f562' }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
      color, fontFamily: 'var(--font-display)',
    }}>
      {children}
    </span>
  );
}

export function Grid2({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>;
}

export function FullWidth({ children }) {
  return <div style={{ gridColumn: '1 / -1' }}>{children}</div>;
}
