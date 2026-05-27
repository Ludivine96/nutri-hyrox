import React, { useState } from 'react';
import { calcDayTotals } from '../utils/storage';
import { MacroRing, MacroBar, MacroChip, Card, SectionLabel, Btn, Tag, Alert, Toggle } from './UI';

function MealCard({ meal, onDelete }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{meal.name}</div>
          {meal.description && <div style={{ fontSize: 12, color: '#a0a0a0', marginTop: 2, lineHeight: 1.4 }}>{meal.description}</div>}
          <div style={{ fontSize: 11, color: '#555', marginTop: 3 }}>{meal.time}</div>
        </div>
        <button onClick={() => onDelete(meal.id)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 16, padding: '2px 6px', cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        <MacroChip value={meal.calories} unit="kcal" color="#c8f562" />
        <MacroChip value={`${meal.protein}g`} unit="prot" />
        <MacroChip value={`${meal.carbs}g`} unit="gluc" />
        <MacroChip value={`${meal.fat}g`} unit="lip" />
      </div>
    </Card>
  );
}

export default function Journal({ dayData, targets, profile, onUpdateDay, onNavigateAdd }) {
  const { meals = [], supplements = [], steps = 0, summary = '' } = dayData;
  const totals = calcDayTotals(meals);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleDeleteMeal = (id) => {
    onUpdateDay({ ...dayData, meals: meals.filter(m => m.id !== id), summary: '' });
  };

  const handleToggleSupp = (id) => {
    const updated = supplements.map(s => s.id === id ? { ...s, taken: !s.taken } : s);
    onUpdateDay({ ...dayData, supplements: updated });
  };

  const handleSummary = () => {
    const remaining = {
      calories: targets.calories - totals.calories,
      protein: targets.protein - totals.protein,
    };
    const pctCal = Math.round((totals.calories / targets.calories) * 100);
    const pctProt = Math.round((totals.protein / targets.protein) * 100);
    let bilan = '';
    if (pctCal < 80) bilan += `Tu es à ${pctCal}% de tes calories (${totals.calories}/${targets.calories} kcal). Il te reste ~${remaining.calories} kcal à combler. `;
    else if (pctCal > 110) bilan += `Tu as dépassé tes calories (${totals.calories}/${targets.calories} kcal). `;
    else bilan += `Calories au top ! ${totals.calories}/${targets.calories} kcal (${pctCal}%). `;
    if (pctProt < 80) bilan += `Protéines insuffisantes : ${totals.protein}g/${targets.protein}g. Pense à ajouter une source protéinée. `;
    else bilan += `Protéines bien couvertes : ${totals.protein}g/${targets.protein}g (${pctProt}%). `;
    const suppTaken = supplements.filter(s => s.taken).length;
    bilan += `Compléments pris : ${suppTaken}/${supplements.length}.`;
    onUpdateDay({ ...dayData, summary: bilan });
  };

  const pctCal = Math.min(totals.calories / (targets.calories || 1), 1);

  return (
    <div>
      {alert && <div style={{ padding: '0 20px', paddingTop: 12 }}><Alert msg={alert.msg} type={alert.type} /></div>}

      {/* Macro overview */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>Aujourd'hui</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
            <MacroRing consumed={totals.calories} target={targets.calories} size={100} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>{totals.calories}</div>
              <div style={{ fontSize: 9, color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>/ {targets.calories}</div>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <MacroBar name="Protéines" consumed={totals.protein} target={targets.protein} color="#c8f562" />
            <MacroBar name="Glucides" consumed={totals.carbs} target={targets.carbs} color="#f5a623" />
            <MacroBar name="Lipides" consumed={totals.fat} target={targets.fat} color="#6b8cff" />
          </div>
        </div>

        {/* Steps */}
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>👟</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{steps.toLocaleString('fr-FR')} pas</div>
              <div style={{ fontSize: 11, color: '#555' }}>objectif 8 000</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => onUpdateDay({ ...dayData, steps: Math.max(0, steps - 500) })}
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, width: 28, height: 28, color: '#a0a0a0', fontSize: 16, cursor: 'pointer' }}>−</button>
            <button onClick={() => onUpdateDay({ ...dayData, steps: steps + 500 })}
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, width: 28, height: 28, color: '#a0a0a0', fontSize: 16, cursor: 'pointer' }}>+</button>
          </div>
        </div>
      </div>

      {/* Idea button */}
      <div style={{ padding: '0 20px 20px' }}>
        <Btn variant="orange" onClick={handleIdea} disabled={ideaLoading}>
          {ideaLoading ? '⏳ Réflexion…' : '🍽️ J\'ai faim, qu\'est-ce que je mange ?'}
        </Btn>
        {ideaText && (
          <div style={{ background: '#111', border: '1px solid #f5a623', borderRadius: 14, padding: 16, fontSize: 13, lineHeight: 1.7, color: '#f0ede6', whiteSpace: 'pre-wrap', marginTop: 10 }}>
            {ideaText}
          </div>
        )}
      </div>

      {/* Meals */}
      <div style={{ padding: '0 20px' }}>
        <SectionLabel>Repas du jour</SectionLabel>
        {meals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#555', fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🥗</div>
            <div>Aucun repas enregistré</div>
            <div style={{ marginTop: 12 }}><Btn variant="secondary" onClick={onNavigateAdd} style={{ width: 'auto', padding: '10px 20px' }}>+ Ajouter un repas</Btn></div>
          </div>
        ) : (
          meals.map(m => <MealCard key={m.id} meal={m} onDelete={handleDeleteMeal} />)
        )}
      </div>

      {/* Supplements */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>Compléments du jour</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {supplements.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', background: '#111', borderRadius: 10,
              border: `1px solid ${s.taken ? '#c8f562' : '#2a2a2a'}`, transition: 'border-color 0.2s',
            }}>
              <span style={{ fontSize: 13 }}>{s.name}</span>
              <Toggle on={s.taken} onToggle={() => handleToggleSupp(s.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* Daily summary */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>Bilan de journée</SectionLabel>
        <Btn onClick={handleSummary} disabled={meals.length === 0}>
          📊 Générer mon bilan
        </Btn>
        {meals.length === 0 && <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>Ajoute des repas pour générer ton bilan.</div>}
        {summary && (
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 18, fontSize: 14, lineHeight: 1.7, color: '#f0ede6', whiteSpace: 'pre-wrap', marginTop: 12 }}>
            {summary}
          </div>
        )}
      </div>

      <div style={{ height: 20 }} />
    </div>
  );
}
