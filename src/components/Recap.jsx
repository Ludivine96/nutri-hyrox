import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { loadWeight, saveWeight, loadAllDays, getLast7Days, formatDateShort, calcDayTotals } from '../utils/storage';
import { SectionLabel, Card, Btn, Alert, Field, Input } from './UI';

export default function Recap({ profile, targets }) {
  const [weight, setWeight] = useState(loadWeight);
  const [weightInput, setWeightInput] = useState('');
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleAddWeight = () => {
    if (!weightInput || isNaN(+weightInput)) { showAlert('Entre un poids valide.', 'error'); return; }
    const today = new Date().toISOString().slice(0, 10);
    const existing = weight.findIndex(w => w.date === today);
    let updated;
    if (existing >= 0) {
      updated = weight.map((w, i) => i === existing ? { ...w, value: +weightInput } : w);
    } else {
      updated = [...weight, { date: today, value: +weightInput }].sort((a, b) => a.date.localeCompare(b.date));
    }
    setWeight(updated);
    saveWeight(updated);
    setWeightInput('');
    showAlert('✓ Poids enregistré !');
  };

  // Last 7 days nutrition data
  const last7 = getLast7Days();
  const allDays = loadAllDays();
  const weekData = last7.map(date => {
    const d = allDays[date] || {};
    const totals = calcDayTotals(d.meals || []);
    return { date: formatDateShort(date), calories: totals.calories, protein: totals.protein, carbs: totals.carbs };
  });

  const avgCalories = Math.round(weekData.reduce((a, d) => a + d.calories, 0) / 7);
  const avgProtein = Math.round(weekData.reduce((a, d) => a + d.protein, 0) / 7);
  const daysLogged = weekData.filter(d => d.calories > 0).length;

  // Weight chart data
  const last30Weight = weight.slice(-30).map(w => ({ date: formatDateShort(w.date), value: w.value }));
  const minWeight = Math.min(...last30Weight.map(w => w.value)) - 1;
  const maxWeight = Math.max(...last30Weight.map(w => w.value)) + 1;
  const latestWeight = weight.length > 0 ? weight[weight.length - 1].value : null;
  const startWeight = weight.length > 0 ? weight[0].value : null;
  const diff = latestWeight && startWeight ? (latestWeight - startWeight).toFixed(1) : null;

  return (
    <div style={{ padding: '20px' }}>

      {/* Weight section */}
      <SectionLabel>Suivi du poids</SectionLabel>
      <Alert msg={alert?.msg} type={alert?.type} />

      {/* Current weight + entry */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <Field label="Poids aujourd'hui (kg)">
            <Input type="number" placeholder={`Ex: ${profile?.weight || 60}`} value={weightInput} onChange={e => setWeightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddWeight()} />
          </Field>
        </div>
        <Btn onClick={handleAddWeight} style={{ width: 'auto', padding: '11px 18px', flexShrink: 0 }}>+</Btn>
      </div>

      {/* Weight stats */}
      {latestWeight && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Actuel', val: `${latestWeight}kg`, color: '#f0ede6' },
            { label: 'Départ', val: startWeight ? `${startWeight}kg` : '—', color: '#a0a0a0' },
            { label: 'Évolution', val: diff ? `${diff > 0 ? '+' : ''}${diff}kg` : '—', color: diff < 0 ? '#c8f562' : diff > 0 ? '#ff5c5c' : '#a0a0a0' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Weight chart */}
      {last30Weight.length > 1 && (
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: '16px 8px 8px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#555', paddingLeft: 10, marginBottom: 10 }}>Évolution (30 derniers jours)</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={last30Weight} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#555' }} axisLine={false} tickLine={false} />
              <YAxis domain={[minWeight, maxWeight]} tick={{ fontSize: 9, fill: '#555' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v}kg`, 'Poids']} />
              <Line type="monotone" dataKey="value" stroke="#c8f562" strokeWidth={2} dot={{ fill: '#c8f562', r: 3 }} activeDot={{ r: 5 }} />
              {profile?.weight && <ReferenceLine y={profile.weight} stroke="#555" strokeDasharray="4 4" label={{ value: 'départ', fill: '#555', fontSize: 9 }} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weekly nutrition recap */}
      <SectionLabel>Récap nutrition — 7 jours</SectionLabel>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Moy. calories', val: avgCalories || '—', unit: 'kcal', target: targets?.calories, color: '#c8f562' },
          { label: 'Moy. protéines', val: avgProtein || '—', unit: 'g', target: targets?.protein, color: '#f5a623' },
          { label: 'Jours loggés', val: daysLogged, unit: '/ 7', color: '#6b8cff' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}<span style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-body)', fontWeight: 400 }}> {s.unit}</span></div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{s.label}</div>
            {s.target && <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>cible: {s.target}</div>}
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: '16px 8px 8px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#555', paddingLeft: 10, marginBottom: 10 }}>Calories & protéines (7 jours)</div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={weekData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#555' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#555' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="calories" stroke="#c8f562" strokeWidth={2} dot={{ fill: '#c8f562', r: 3 }} name="Calories" />
            <Line type="monotone" dataKey="protein" stroke="#f5a623" strokeWidth={2} dot={{ fill: '#f5a623', r: 3 }} name="Protéines (g)" />
            {targets?.calories && <ReferenceLine y={targets.calories} stroke="#c8f562" strokeDasharray="3 3" strokeOpacity={0.4} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ height: 20 }} />
    </div>
  );
}
