import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import './App.css';

const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'procvetanje2025';
const TOTAL_DAYS = 40;
const START_DATE = new Date('2026-05-25');

function getCurrentDay() {
  const today = new Date();
  const diff = Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24)) + 1;
  if (diff < 1) return 1;
  if (diff > TOTAL_DAYS) return 1;
  return diff;
}

export default function App() {
  const [screen, setScreen] = useState('prijava'); // prijava | danas | zbornik | admin
  const [ucesnica, setUcesnica] = useState(() => {
    try { return JSON.parse(localStorage.getItem('procv_ucesnica')) || null; } catch { return null; }
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentDay, setCurrentDay] = useState(getCurrentDay());
  const [radaMisao, setRadaMisao] = useState('');
  const [unosiDana, setUnosiDana] = useState([]);
  const [tapkanja, setTapkanja] = useState([]);
  const [snimakUrl, setSnimakUrl] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ucesnica) setScreen('danas');
  }, [ucesnica]);

  useEffect(() => {
    if (screen === 'danas' || screen === 'admin') {
      loadDan();
      loadTapkanja();
    }
    if (screen === 'zbornik') loadZbornik();
  }, [screen, currentDay]);

  async function loadDan() {
    const [misaoRes, unosiRes, snimakRes] = await Promise.all([
      supabase.from('misli_rade').select('*').eq('dan', currentDay).single(),
      supabase.from('unosi_grupe').select('*').eq('dan', currentDay).order('created_at', { ascending: false }),
      supabase.from('snimci_prakse').select('*').eq('dan', currentDay).single(),
    ]);
    setRadaMisao(misaoRes.data?.tekst || '');
    setUnosiDana(unosiRes.data || []);
    setSnimakUrl(snimakRes.data?.url || '');
  }

  async function loadTapkanja() {
    const { data } = await supabase.from('tapkanja').select('*').order('redosled');
    setTapkanja(data || []);
  }

  const [zborniData, setZborniData] = useState([]);
  async function loadZbornik() {
    const { data } = await supabase
      .from('unosi_grupe').select('*').order('dan').order('created_at');
    const { data: misli } = await supabase.from('misli_rade').select('*').order('dan');
    const dani = {};
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      dani[d] = { dan: d, radaMisao: '', unosi: [] };
    }
    (misli || []).forEach(m => { if (dani[m.dan]) dani[m.dan].radaMisao = m.tekst; });
    (data || []).forEach(u => { if (dani[u.dan]) dani[u.dan].unosi.push(u); });
    setZborniData(Object.values(dani).filter(d => d.radaMisao || d.unosi.length > 0));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  if (screen === 'prijava') return <Prijava onPrijava={ime => {
    const u = { ime };
    localStorage.setItem('procv_ucesnica', JSON.stringify(u));
    setUcesnica(u);
    setScreen('danas');
  }} />;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-logo">Rada Vučićević · Kundalini joga</div>
        <h1 className="header-title">Procvetanje</h1>
        <p className="header-sub">40 jutara od promene ka isceljenju</p>
        <nav className="app-nav">
          <button className={screen==='danas'?'active':''} onClick={() => setScreen('danas')}>Danas</button>
          <button className={screen==='zbornik'?'active':''} onClick={() => setScreen('zbornik')}>Zbornik</button>
          <button className={screen==='admin'?'active':''} onClick={() => {
            if (!isAdmin) {
              const p = window.prompt('Admin lozinka:');
              if (p === ADMIN_PASSWORD) { setIsAdmin(true); setScreen('admin'); }
              else showToast('Pogrešna lozinka');
            } else setScreen('admin');
          }}>Admin</button>
        </nav>
      </header>

      {toast && <div className="toast">{toast}</div>}

      {screen === 'danas' && (
        <DanasScreen
          currentDay={currentDay}
          setCurrentDay={setCurrentDay}
          radaMisao={radaMisao}
          unosiDana={unosiDana}
          tapkanja={tapkanja}
          snimakUrl={snimakUrl}
          ucesnica={ucesnica}
          onUnos={async (misao, izazov) => {
            setLoading(true);
            console.log('Saving:', currentDay, url);
const { data, error } = await supabase.from('snimci_prakse').upsert({ dan: currentDay, url }, { onConflict: 'dan' });
console.log('Result:', data, error);
if (error) { showToast('Greška: ' + error.message); return; }
setSnimakUrl(url);
showToast('Snimak sačuvan · dan ' + currentDay + ' ✦');
loadDan(currentDay);
              ucesnica_ime: ucesnica.ime,
              dan: currentDay,
              misao,
              izazov,
            });
            setLoading(false);
            if (!error) { showToast('Glas dodat ✦'); loadDan(); }
            else showToast('Greška, pokušaj ponovo');
          }}
          loading={loading}
        />
      )}

      {screen === 'zbornik' && (
        <ZborniScreen zborniData={zborniData} />
      )}

      {screen === 'admin' && (
        <AdminScreen
          currentDay={currentDay}
          tapkanja={tapkanja}
          snimakUrl={snimakUrl}
          radaMisao={radaMisao}
          onSaveMisao={async (tekst) => {
            await supabase.from('misli_rade').upsert({ dan: currentDay, tekst, updated_at: new Date() }, { onConflict: 'dan' });
            showToast('Misao sačuvana ✦'); loadDan();
          }}
          onSaveSnimak={async (url) => {
            await supabase.from('snimci_prakse').upsert({ dan: currentDay, url }, { onConflict: 'dan' });
            showToast('Snimak sačuvan ✦'); loadDan();
          }}
          onAddTapkanje={async (t) => {
            await supabase.from('tapkanja').insert({ ...t, redosled: tapkanja.length });
            showToast('Tapkanje dodato ✦'); loadTapkanja();
          }}
          onDeleteTapkanje={async (id) => {
            await supabase.from('tapkanja').delete().eq('id', id);
            showToast('Obrisano'); loadTapkanja();
          }}
          onUpdateTapkanje={async (id, data) => {
            await supabase.from('tapkanja').update(data).eq('id', id);
            showToast('Sačuvano ✦'); loadTapkanja();
          }}
        />
      )}
    </div>
  );
}

function Prijava({ onPrijava }) {
  const [ime, setIme] = useState('');
  return (
    <div className="prijava-wrap">
      <div className="prijava-card">
        <div className="prijava-title">Dobrodošla</div>
        <p className="prijava-sub">Upiši svoje ime da bi tvoji glasovi bili sačuvani u zborniku grupe.</p>
        <input
          className="inp"
          type="text"
          placeholder="Tvoje ime..."
          value={ime}
          onChange={e => setIme(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ime.trim() && onPrijava(ime.trim())}
          autoFocus
        />
        <button className="btn-primary" onClick={() => ime.trim() && onPrijava(ime.trim())}>
          Ulaz u grupu ✦
        </button>
      </div>
    </div>
  );
}

function DanasScreen({ currentDay, setCurrentDay, radaMisao, unosiDana, tapkanja, snimakUrl, ucesnica, onUnos, loading }) {
  const [misao, setMisao] = useState('');
  const [izazov, setIzazov] = useState('');
  const vecUpisala = unosiDana.some(u => u.ucesnica_ime === ucesnica?.ime);

  return (
    <main className="main">
      <div className="day-nav-bar">
        <button onClick={() => setCurrentDay(d => Math.max(1, d-1))} disabled={currentDay <= 1}>←</button>
        <div className="day-num-display"><span className="day-big">{currentDay}</span><span className="day-of">od 40</span></div>
        <button onClick={() => setCurrentDay(d => Math.min(TOTAL_DAYS, d+1))} disabled={currentDay >= TOTAL_DAYS}>→</button>
      </div>

      {snimakUrl && (
        <section className="section-dark">
          <div className="section-label gold">Snimak jutarnje prakse</div>
          <a className="media-btn" href={snimakUrl} target="_blank" rel="noopener noreferrer">
            ▶ Otvori snimak · Dan {currentDay}
          </a>
        </section>
      )}

      {tapkanja.length > 0 && (
        <section className="section-mid">
          <div className="section-label gold">Tapkanje meridijana · Ljilja</div>
          <div className="tapkanja-lista">
            {tapkanja.map(t => (
              <div key={t.id} className="tapkanje-card">
                <div className="tapkanje-naziv">{t.naziv}</div>
                {t.opis && <div className="tapkanje-opis">{t.opis}</div>}
                <div className="tapkanje-btns">
                  {t.url_video && <a className="media-btn small" href={t.url_video} target="_blank" rel="noopener noreferrer">▶ Video</a>}
                  {t.url_audio && <a className="media-btn small" href={t.url_audio} target="_blank" rel="noopener noreferrer">♪ Audio</a>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section-light">
        <div className="section-label dark">Misao dana · Rada</div>
        {radaMisao
          ? <blockquote className="rada-misao">„{radaMisao}"</blockquote>
          : <p className="placeholder-text">Misao dana još nije dodana.</p>
        }
      </section>

      <section className="section-light border-top">
        <div className="section-label dark">Glasovi grupe · Dan {currentDay}</div>
        {!vecUpisala ? (
          <div className="forma">
            <textarea className="inp" rows={3} placeholder="Moja misao za danas..." value={misao} onChange={e => setMisao(e.target.value)} />
            <textarea className="inp" rows={2} placeholder="Moj izazov danas... (opciono)" value={izazov} onChange={e => setIzazov(e.target.value)} />
            <button className="btn-primary" onClick={() => { if (misao.trim()) { onUnos(misao.trim(), izazov.trim()); setMisao(''); setIzazov(''); }}} disabled={loading}>
              {loading ? 'Šaljem...' : `Dodaj glas · ${ucesnica?.ime} ✦`}
            </button>
          </div>
        ) : (
          <p className="vec-upisala">✦ Tvoj glas za danas je sačuvan</p>
        )}

        <div className="unosi-lista">
          {unosiDana.length === 0
            ? <p className="placeholder-text">Budi prva koja dodaje glas za ovaj dan.</p>
            : unosiDana.map(u => (
              <div key={u.id} className="unos-card">
                <div className="unos-ime">{u.ucesnica_ime}</div>
                <div className="unos-misao">{u.misao}</div>
                {u.izazov && <div className="unos-izazov"><span className="izazov-lbl">Izazov · </span>{u.izazov}</div>}
              </div>
            ))
          }
        </div>
      </section>
    </main>
  );
}

function ZborniScreen({ zborniData }) {
  const ucesnice = new Set();
  let ukupno = 0;
  zborniData.forEach(d => d.unosi.forEach(u => { ucesnice.add(u.ucesnica_ime); ukupno++; }));

  return (
    <main className="main">
      <div className="zbornik-header">
        <h2 className="zbornik-title">Zbornik procvetanja</h2>
        <p className="zbornik-sub">Glasovi 40 jutara · 2025</p>
        <div className="zb-stats">
          <div><span className="zb-num">{ucesnice.size}</span><span className="zb-lbl">učesnica</span></div>
          <div><span className="zb-num">{ukupno}</span><span className="zb-lbl">glasova</span></div>
          <div><span className="zb-num">{zborniData.length}</span><span className="zb-lbl">jutara</span></div>
        </div>
      </div>

      {zborniData.length === 0
        ? <p className="placeholder-text center">Zbornik raste svakim danom ✦</p>
        : zborniData.map(d => (
          <div key={d.dan} className="zb-dan">
            <div className="zb-dan-header">
              <span className="zb-dan-num">Dan {d.dan}</span>
              <div className="zb-line" />
            </div>
            {d.radaMisao && (
              <div className="zb-rada-misao">
                <div className="zb-rada-lbl">Rada · misao dana</div>
                <div className="zb-rada-tekst">{d.radaMisao}</div>
              </div>
            )}
            {d.unosi.map(u => (
              <div key={u.id} className="zb-unos">
                <div className="zb-unos-ime">{u.ucesnica_ime}</div>
                <div className="zb-unos-misao">{u.misao}</div>
                {u.izazov && <div className="zb-unos-izazov"><span className="izazov-lbl">Izazov · </span>{u.izazov}</div>}
              </div>
            ))}
          </div>
        ))
      }
    </main>
  );
}

function AdminScreen({ currentDay, tapkanja, snimakUrl, radaMisao, onSaveMisao, onSaveSnimak, onAddTapkanje, onDeleteTapkanje, onUpdateTapkanje }) {
  const [misaoInp, setMisaoInp] = useState(radaMisao);
  const [snimakInp, setSnimakInp] = useState(snimakUrl);
  const [novTapNaziv, setNovTapNaziv] = useState('');
  const [novTapOpis, setNovTapOpis] = useState('');
  const [novTapVideo, setNovTapVideo] = useState('');
  const [novTapAudio, setNovTapAudio] = useState('');
  const [editTap, setEditTap] = useState(null);

  useEffect(() => { setMisaoInp(radaMisao); setSnimakInp(snimakUrl); }, [radaMisao, snimakUrl]);

  return (
    <main className="main admin">
      <div className="admin-section">
        <div className="section-label gold">Dan {currentDay} · Misao</div>
        <textarea className="inp" rows={3} value={misaoInp} onChange={e => setMisaoInp(e.target.value)} placeholder="Upiši misao dana..." />
        <button className="btn-primary" onClick={() => onSaveMisao(misaoInp)}>Sačuvaj misao</button>
      </div>

      <div className="admin-section">
        <div className="section-label gold">Dan {currentDay} · Snimak prakse</div>
        <input className="inp" type="url" value={snimakInp} onChange={e => setSnimakInp(e.target.value)} placeholder="Google Drive / YouTube link..." />
        <button className="btn-primary" onClick={() => onSaveSnimak(snimakInp)}>Sačuvaj link</button>
      </div>

      <div className="admin-section">
        <div className="section-label gold">Tapkanja · Ljilja</div>
        {tapkanja.map(t => (
          <div key={t.id} className="tap-admin-card">
            {editTap === t.id ? (
              <EditTapkanje t={t} onSave={(data) => { onUpdateTapkanje(t.id, data); setEditTap(null); }} onCancel={() => setEditTap(null)} />
            ) : (
              <>
                <div className="tap-admin-naziv">{t.naziv}</div>
                {t.opis && <div className="tap-admin-opis">{t.opis}</div>}
                <div className="tap-admin-links">
                  {t.url_video && <span>▶ Video</span>}
                  {t.url_audio && <span>♪ Audio</span>}
                </div>
                <div className="tap-admin-actions">
                  <button className="btn-xs" onClick={() => setEditTap(t.id)}>Uredi</button>
                  <button className="btn-xs danger" onClick={() => window.confirm('Obrisati?') && onDeleteTapkanje(t.id)}>Obriši</button>
                </div>
              </>
            )}
          </div>
        ))}
        <div className="add-tapkanje">
          <div className="section-label gold" style={{marginTop:'1rem'}}>Dodaj novo tapkanje</div>
          <input className="inp" placeholder="Naziv (npr. Tapkanje za stres)" value={novTapNaziv} onChange={e => setNovTapNaziv(e.target.value)} />
          <input className="inp" placeholder="Kratki opis (opciono)" value={novTapOpis} onChange={e => setNovTapOpis(e.target.value)} />
          <input className="inp" type="url" placeholder="Video link (YouTube / Drive)" value={novTapVideo} onChange={e => setNovTapVideo(e.target.value)} />
          <input className="inp" type="url" placeholder="Audio link (Drive / SoundCloud)" value={novTapAudio} onChange={e => setNovTapAudio(e.target.value)} />
          <button className="btn-primary" onClick={() => {
            if (!novTapNaziv.trim()) return;
            onAddTapkanje({ naziv: novTapNaziv, opis: novTapOpis, url_video: novTapVideo, url_audio: novTapAudio });
            setNovTapNaziv(''); setNovTapOpis(''); setNovTapVideo(''); setNovTapAudio('');
          }}>Dodaj tapkanje ✦</button>
        </div>
      </div>
    </main>
  );
}

function EditTapkanje({ t, onSave, onCancel }) {
  const [naziv, setNaziv] = useState(t.naziv);
  const [opis, setOpis] = useState(t.opis || '');
  const [video, setVideo] = useState(t.url_video || '');
  const [audio, setAudio] = useState(t.url_audio || '');
  return (
    <div>
      <input className="inp" value={naziv} onChange={e => setNaziv(e.target.value)} placeholder="Naziv" />
      <input className="inp" value={opis} onChange={e => setOpis(e.target.value)} placeholder="Opis" />
      <input className="inp" type="url" value={video} onChange={e => setVideo(e.target.value)} placeholder="Video link" />
      <input className="inp" type="url" value={audio} onChange={e => setAudio(e.target.value)} placeholder="Audio link" />
      <div style={{display:'flex',gap:'8px',marginTop:'6px'}}>
        <button className="btn-primary" onClick={() => onSave({ naziv, opis, url_video: video, url_audio: audio })}>Sačuvaj</button>
        <button className="btn-xs" onClick={onCancel}>Odustani</button>
      </div>
    </div>
  );
}
