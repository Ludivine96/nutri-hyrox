import React, { useState } from 'react';
import { loadSport, saveSport, exportSportCSV, importSportCSV, SPORT_TYPES } from '../utils/storage';
import { SectionLabel, Card, MacroChip, Btn, Alert, Field, Input, Select, Grid2, FullWidth, Tag } from './UI';

function SessionCard({ session, onDelete }) {
  const sport = SPORT_TYPES.find(s => s.id === session.type) || SPORT_TYPES[SPORT_TYPES.length - 1];
  const intensityColor = { faible: '#6b8cff', modérée: '#f5a623', élevée: '#c8f562', maximale: '#ff5c5c' };
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, flex: 1 }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>{sport.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <Tag color={intensityColor[session.intensity] || '#c8f562'}>{session.intensity}</Tag>
            </div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{sport.label}</div>
            <div style={{ fontSize: 12, color: '#a0a0a0', marginTop: 2 }}>{session.date} · {session.duration} min</div>
            {session.notes && <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{session.notes}</div>}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <MacroChip value={`${session.duration}min`} unit="" color="#f5a623" />
              <MacroChip value={`~${session.calories}`} unit="kcal" color="#c8f562" />
            </div>
          </div>
        </div>
        <button onClick={() => onDelete(session.id)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 16, padding: '2px 6px', cursor: 'pointer' }}>✕</button>
      </div>
    </Card>
  );
}

export default function Sport() {
  const [sessions, setSessions] = useState(loadSport);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'hyrox',
    duration: '60',
    intensity: 'modérée',
    notes: '',
  });

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calcCalories = (type, duration, intensity) => {
    const sport = SPORT_TYPES.find(s => s.id === type) || SPORT_TYPES[0];
    const multipliers = { faible: 0.7, modérée: 1.0, élevée: 1.3, maximale: 1.6 };
    return Math.round(sport.calPer30 * (duration / 30) * (multipliers[intensity] || 1));
  };

  const handleAdd = () => {
    if (!form.date || !form.duration) { showAlert('Remplis la date et la durée.', 'error'); return; }
    const newSession = {
      id: Date.now(),
      ...form,
      duration: +form.duration,
      calories: calcCalories(form.type, +form.duration, form.intensity),
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    saveSport(updated);
    setShowForm(false);
    setForm({ date: new Date().toISOString().slice(0, 10), type: 'hyrox', duration: '60', intensity: 'modérée', notes: '' });
    showAlert('✓ Séance ajoutée !');
  };

  const handleDelete = (id) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    saveSport(updated);
  };

  const handleExport = () => {
    if (sessions.length === 0) { showAlert('Aucune séance à exporter.', 'error'); return; }
    exportSportCSV(sessions);
    showAlert('✓ Export CSV téléchargé !');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = importSportCSV(ev.target.result);
        const updated = [...sessions, ...imported];
        setSessions(updated);
        saveSport(updated);
        showAlert(`✓ ${imported.length} séance(s) importée(s) !`);
      } catch {
        showAlert('Erreur lors de l\'import CSV.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Stats
  const totalSessions = sessions.length;
  const totalCalories = sessions.reduce((a, s) => a + (s.calories || 0), 0);
  const totalMinutes = sessions.reduce((a, s) => a + (s.duration || 0), 0);
  const thisWeek = sessions.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  return (
    <div style={{ padding: '20px' }}>
      <SectionLabel>Sport & Entraînement</SectionLabel>
      <Alert msg={alert?.msg} type={alert?.type} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { icon: '🏆', val: thisWeek, label: 'séances cette semaine' },
          { icon: '🔥', val: `${totalCalories.toLocaleString('fr-FR')}`, label: 'kcal brûlées total' },
          { icon: '⏱️', val: `${Math.round(totalMinutes / 60)}h`, label: 'entraînement total' },
          { icon: '📈', val: totalSessions, label: 'séances enregistrées' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 6 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Btn onClick={() => setShowForm(!showForm)} style={{ flex: 2 }}>
          {showForm ? '✕ Annuler' : '+ Ajouter une séance'}
        </Btn>
        <Btn variant="secondary" onClick={handleExport} style={{ flex: 1, fontSize: 12 }}>📥 Export CSV</Btn>
      </div>

      {/* Import */}
      <label style={{ display: 'block', marginBottom: 16 }}>
        <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
        <div style={{
          border: '1px dashed #2a2a2a', borderRadius: 12, padding: '12px 16px',
          textAlign: 'center', fontSize: 13, color: '#555', cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}>
          📤 Importer un fichier CSV
        </div>
      </label>

      {/* Add form */}
      {showForm && (
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: '#c8f562' }}>Nouvelle séance</div>
          <Grid2>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </Field>
            <Field label="Durée (min)">
              <Input type="number" placeholder="60" value={form.duration} onChange={e => set('duration', e.target.value)} />
            </Field>
            <FullWidth>
              <Field label="Type de séance">
                <Select value={form.type} onChange={e => set('type', e.target.value)}>
                  {SPORT_TYPES.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
                </Select>
              </Field>
            </FullWidth>
            <FullWidth>
              <Field label="Intensité">
                <Select value={form.intensity} onChange={e => set('intensity', e.target.value)}>
                  <option value="faible">Faible</option>
                  <option value="modérée">Modérée</option>
                  <option value="élevée">Élevée</option>
                  <option value="maximale">Maximale</option>
                </Select>
              </Field>
            </FullWidth>
            <FullWidth>
              <Field label="Notes (optionnel)">
                <Input placeholder="Ex: PR sled push, douleur épaule gauche…" value={form.notes} onChange={e => set('notes', e.target.value)} />
              </Field>
            </FullWidth>
          </Grid2>
          <div style={{ marginTop: 14, background: '#1a1a1a', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#a0a0a0' }}>
            🔥 Calories estimées : <span style={{ color: '#c8f562', fontWeight: 600 }}>~{calcCalories(form.type, +form.duration || 60, form.intensity)} kcal</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <Btn onClick={handleAdd}>Enregistrer la séance</Btn>
          </div>
        </div>
      )}

      {/* Sessions list */}
      <SectionLabel>Historique</SectionLabel>
      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 0', color: '#555', fontSize: 13 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏋️‍♀️</div>
          Aucune séance enregistrée
        </div>
      ) : (
        sessions.map(s => <SessionCard key={s.id} session={s} onDelete={handleDelete} />)
      )}
    </div>
  );
}
