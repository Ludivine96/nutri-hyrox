import React, { useState } from 'react';
import { loadFavorites, saveFavorites } from '../utils/storage';
import { SectionLabel, Card, MacroChip, Btn, Alert, Tag, Input, Field } from './UI';

function FavCard({ fav, onAdd, onDelete }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 30, flexShrink: 0 }}>{fav.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Tag color="#c8f562">{fav.tag}</Tag>
          <div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>{fav.name}</div>
          {fav.description && <div style={{ fontSize: 11, color: '#a0a0a0', marginTop: 2, lineHeight: 1.4 }}>{fav.description}</div>}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <MacroChip value={fav.calories} unit="kcal" color="#c8f562" />
            <MacroChip value={`${fav.protein}g`} unit="prot" />
            <MacroChip value={`${fav.carbs}g`} unit="gluc" />
            <MacroChip value={`${fav.fat}g`} unit="lip" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <button onClick={() => onAdd(fav)} style={{
            background: '#c8f562', color: '#0a0a0a', border: 'none', borderRadius: 10,
            padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>+ Ajouter</button>
          <button onClick={() => onDelete(fav.id)} style={{
            background: 'rgba(255,92,92,0.1)', color: '#ff5c5c', border: '1px solid rgba(255,92,92,0.3)',
            borderRadius: 10, padding: '6px 12px', fontSize: 11, cursor: 'pointer',
          }}>Supprimer</button>
        </div>
      </div>
    </Card>
  );
}

export default function Favorites({ onAddToJournal }) {
  const [favs, setFavs] = useState(loadFavorites);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleAdd = (fav) => {
    onAddToJournal({
      id: Date.now(),
      name: fav.name,
      calories: fav.calories,
      protein: fav.protein,
      carbs: fav.carbs,
      fat: fav.fat,
      description: fav.description,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    });
    showAlert(`${fav.emoji} ${fav.name} ajouté !`);
  };

  const handleDelete = (id) => {
    const updated = favs.filter(f => f.id !== id);
    setFavs(updated);
    saveFavorites(updated);
  };

  const filtered = favs.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.tag || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <SectionLabel>Mes repas favoris</SectionLabel>
      <Alert msg={alert?.msg} type={alert?.type} />

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="🔍 Rechercher un repas…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ fontSize: 12, color: '#555', marginBottom: 16, lineHeight: 1.5 }}>
        Un clic pour ajouter au journal. Ajoute de nouveaux favoris depuis l'onglet ✨ Ajouter.
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#555', fontSize: 13 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⭐</div>
          {search ? 'Aucun résultat pour cette recherche.' : 'Aucun favori enregistré. Ajoute tes repas habituels !'}
        </div>
      ) : (
        filtered.map(f => <FavCard key={f.id} fav={f} onAdd={handleAdd} onDelete={handleDelete} />)
      )}
    </div>
  );
}
