import React, { useState } from 'react';
import { calcTargets } from '../utils/storage';
import { Btn, Field, Input, Select, Grid2, FullWidth } from './UI';

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ weight: '', height: '', age: '', activityLevel: 'very_active', goal: 'lose' });
  const [targets, setTargets] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.weight && form.height && form.age;

  const handleCalc = () => {
    const p = { ...form, weight: +form.weight, height: +form.height, age: +form.age };
    const t = calcTargets(p);
    setTargets(t);
    setStep(2);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '48px 20px 0' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1 }}>
          nutri<span style={{ color: '#c8f562' }}>.</span>hyrox
        </div>
        <div style={{ fontSize: 14, color: '#555', marginTop: 8, fontWeight: 300 }}>
          {step === 1 ? 'Configure ton profil pour des cibles personnalisées.' : 'Tes cibles sont prêtes !'}
        </div>
      </div>

      <div style={{ flex: 1, padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {step === 1 && (
          <>
            <Grid2>
              <Field label="Poids (kg)"><Input type="number" placeholder="60" value={form.weight} onChange={e => set('weight', e.target.value)} /></Field>
              <Field label="Taille (cm)"><Input type="number" placeholder="168" value={form.height} onChange={e => set('height', e.target.value)} /></Field>
              <Field label="Âge"><Input type="number" placeholder="25" value={form.age} onChange={e => set('age', e.target.value)} /></Field>
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
            <Btn disabled={!valid} onClick={handleCalc}>Calculer mes cibles →</Btn>
          </>
        )}

        {step === 2 && targets && (
          <>
            <div style={{ background: '#111', border: '1px solid #c8f562', borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8f562', marginBottom: 14, fontFamily: 'var(--font-display)' }}>Tes cibles journalières</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[{ v: targets.calories, l: 'kcal' }, { v: `${targets.protein}g`, l: 'protéines' }, { v: `${targets.carbs}g`, l: 'glucides' }, { v: `${targets.fat}g`, l: 'lipides' }].map((t, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#f0ede6' }}>{t.v}</div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{t.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <Btn onClick={() => onDone({ profile: { ...form, weight: +form.weight, height: +form.height, age: +form.age }, targets })}>
              C'est parti ! →
            </Btn>
            <Btn variant="secondary" onClick={() => setStep(1)}>Modifier</Btn>
          </>
        )}
      </div>
    </div>
  );
}
