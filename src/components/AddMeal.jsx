import React, { useState } from 'react';
import { loadFavorites, saveFavorites } from '../utils/storage';
import { Btn, Field, Input, Grid2, FullWidth, SectionLabel, Alert } from './UI';

export default function AddMeal({ onAdd }) {
  const [manualForm, setManualForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', description: '' });
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleAdd = () => {
    if (!manualForm.name || !manualForm.calories) { showAlert('Remplis au moins le nom et les calories.', 'error'); return; }
    onAdd({
      id: Date.now(),
      name: manualForm.name,
      calories: +manualForm.calories || 0,
      protein: +manualForm.protein || 0,
      carbs: +manualForm.carbs || 0,
      fat: +manualForm.fat || 0,
      description: manualForm.description || '',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    });
    setManualForm({ name: '', calories: '', protein: '', carbs: '', fat: '', description: '' });
    showAlert('✓ Repas ajouté !');
  };

  const handleSaveToFavs = () => {
    if (!manualForm.name) { showAlert('Remplis au moins le nom.', 'error'); return; }
    const favs = loadFavorites();
    const newFav = {
      id: `fav_${Date.now()}`,
      emoji: '⭐',
      name: manualForm.name,
      description: manualForm.description || '',
      calories: +manualForm.calories || 0,
      protein: +manualForm.protein || 0,
      carbs: +manualForm.carbs || 0,
      fat: +manualForm.fat || 0,
      tag: 'Favori',
    };
    saveFavorites([...favs, newFav]);
    showAlert('⭐ Ajouté aux favoris !');
  };

  return (
    <div style={{ padding: '20px' }}>
      <SectionLabel>Ajouter un repas</SectionLabel>
      <Alert msg={alert?.msg} type={alert?.type} />

      <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 16, lineHeight: 1.5, background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: '12px 14px' }}>
        💡 Demande les macros de ton repas à Claude dans le chat, puis saisis-les ici !
      </div>

      <Grid2>
        <FullWidth>
          <Field label="Nom du repas">
            <Input placeholder="Ex: Poulet riz haricots verts" value={manualForm.name} onChange={e => setManualForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
        </FullWidth>
        <Field label="Calories"><Input type="number" placeholder="450" value={manualForm.calories} onChange={e => setManualForm(f => ({ ...f, calories: e.target.value }))} /></Field>
        <Field label="Protéines (g)"><Input type="number" placeholder="40" value={manualForm.protein} onChange={e => setManualForm(f => ({ ...f, protein: e.target.value }))} /></Field>
        <Field label="Glucides (g)"><Input type="number" placeholder="50" value={manualForm.carbs} onChange={e => setManualForm(f => ({ ...f, carbs: e.target.value }))} /></Field>
        <Field label="Lipides (g)"><Input type="number" placeholder="12" value={manualForm.fat} onChange={e => setManualForm(f => ({ ...f, fat: e.target.value }))} /></Field>
        <FullWidth>
          <Field label="Description (optionnel)">
            <Input placeholder="Ex: salade + huile olive" value={manualForm.description} onChange={e => setManualForm(f => ({ ...f, description: e.target.value }))} />
          </Field>
        </FullWidth>
      </Grid2>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Btn onClick={handleAdd}>+ Ajouter au journal</Btn>
        <Btn variant="secondary" onClick={handleSaveToFavs}>⭐ Sauvegarder dans mes favoris</Btn>
      </div>
    </div>
  );
}
