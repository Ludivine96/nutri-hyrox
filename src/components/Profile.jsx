import React, { useState } from 'react';
import { calcTargets, saveProfile } from '../utils/storage';
import { SectionLabel, Btn, Field, Input, Select, Grid2, FullWidth, Alert } from './UI';

export default function Profile({ profile, targets, onUpdate }) {
  const [form, setForm] = useState({ ...profile });
  const [customTargets, setCustomTargets] = useState(targets);
  const [useCustom, setUseCustom] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const set = (k, v) => {
    const updated = { ...form, [k]: v };
    setForm(updated);
    if (!useCustom) {
      const p = { ...updated, weight: +updated.weight, height: +updated.height, age: +updated.age };
      setCustomTargets(calcTargets(p));
    }
  };

  const handleSave = () => {
    const p = { ...form, weight: +form.weight, height: +form.height, age: +form.age };
    const t = useCustom ? customTargets : calcTargets(p);
    try {
      localStorage.setItem('nh_profile_v2', JSON.stringify(p));
      localStorage.setItem('nh_targets_v2', JSON.stringify(t));
    } catch(e) {}
    onUpdate({ profile: p, targets: t });
    saveProfile(p);
    showAlert('✓ Profil sauvegardé !');
  };

  const autoTargets = calcTargets({ ...form, weight: +form.weight, height: +form.height, age: +form.age });

  return (
    <div style={{ padding: '20px' }}>
      <SectionLabel>Mon profil</SectionLabel>
      <Alert msg={alert?.msg} type={alert?.type} />

      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#555', marginBottom: 14, fontFamily: 'var(--font-display)' }}>Infos personnelles</div>
        <Grid2>
          <Field label="Poids (kg)"><Input type="number" value={form.weight} onChange={e => set('weight', e.target.value)} /></Field>
          <Field label="Taille (cm)"><Input type="number" value={form.height} onChange={e => set('height', e.target.value)} /></Field>
          <Field label="Âge"><Input type="number" value={form.age} onChange={e => set('age', e.target.value)} /></Field>
          <Field label="Activité">
            <Select value={form.activityLevel} onChange={e => set('activityLevel', e.target.value)}>
              <option value="moderate">Modéré (3-4j)</option>
              <option value="very_active">Très actif (5-6j)</option>
              <option value="athlete">Athlète (2x/j)</option>
            </Select>
          </Field>
          <FullWidth>
            <Field label="Objectif">
              <Select value={form.goal} onChange={e => set('goal', e.target.value)}>
                <option value="lose">Perdre du poids + performance</option>
                <option value="maintain">Maintenir + performance</option>
              </Select>
            </Field>
          </FullWidth>
        </Grid2>
      </div>

      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#555', fontFamily: 'var(--font-display)' }}>Cibles nutritionnelles</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#555' }}>Manuel</span>
            <button onClick={() => setUseCustom(!useCustom)} style={{
              width: 36, height: 20, borderRadius: 99, background: useCustom ? 'rgba(200,245,98,0.2)' : '#2a2a2a',
              border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            }}>
              <span style={{
                position: 'absolute', width: 14, height: 14, borderRadius: '50%',
                background: useCustom ? '#c8f562' : '#555', top: 3,
                left: useCustom ? 19 : 3, transition: 'left 0.2s, background 0.2s',
              }} />
            </button>
          </div>
        </div>

        {useCustom ? (
          <Grid2>
            <Field label="Calories"><Input type="number" value={customTargets.calories} onChange={e => setCustomTargets(t => ({ ...t, calories: +e.target.value }))} /></Field>
            <Field label="Protéines (g)"><Input type="number" value={customTargets.protein} onChange={e => setCustomTargets(t => ({ ...t, protein: +e.target.value }))} /></Field>
            <Field label="Glucides (g)"><Input type="number" value={customTargets.carbs} onChange={e => setCustomTargets(t => ({ ...t, carbs: +e.target.value }))} /></Field>
            <Field label="Lipides (g)"><Input type="number" value={customTargets.fat} onChange={e => setCustomTargets(t => ({ ...t, fat: +e.target.value }))} /></Field>
          </Grid2>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[{ v: autoTargets.calories, l: 'kcal' }, { v: `${autoTargets.protein}g`, l: 'prot' }, { v: `${autoTargets.carbs}g`, l: 'gluc' }, { v: `${autoTargets.fat}g`, l: 'lip' }].map((t, i) => (
              <div key={i} style={{ textAlign: 'center', background: '#1a1a1a', borderRadius: 10, padding: '10px 6px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#f0ede6' }}>{t.v}</div>
                <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{t.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Btn onClick={handleSave}>Sauvegarder les modifications</Btn>

      <div style={{ marginTop: 32, padding: '16px', background: '#111', border: '1px solid #2a2a2a', borderRadius: 14 }}>
        <div style={{ fontSize: 11, color: '#555', lineHeight: 1.6 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#f0ede6', marginBottom: 8 }}>nutri<span style={{ color: '#c8f562' }}>.</span>hyrox</div>
          <div>App nutrition personnalisée pour athlète Hyrox.</div>
          <div style={{ marginTop: 4 }}>Données stockées localement sur ton appareil.</div>
          <div style={{ marginTop: 4 }}>Macros estimées par <span style={{ color: '#c8f562' }}>Claude</span> dans le chat.</div>
        </div>
      </div>

      <div style={{ height: 20 }} />
    </div>
  );
}
