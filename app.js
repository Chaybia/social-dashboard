// ══════════════════════════════════════════════════════════
//  SOCIAL DASHBOARD — Chaybia Maftaha
//  Groq AI intégré · 5 comptes · 8 modules
// ══════════════════════════════════════════════════════════

const ACCOUNTS = {
  'linkedin-perso': { name:'LinkedIn', sub:'Perso', icon:'in', color:'#0077b5', desc:'Personal branding · Fondatrice', platform:'linkedin', type:'perso' },
  'insta-perso':    { name:'Instagram', sub:'Perso', icon:'◉', color:'#e1306c', desc:'Personal branding · Fondatrice', platform:'instagram', type:'perso' },
  'tiktok-perso':   { name:'TikTok', sub:'Perso', icon:'♪', color:'#ff0050', desc:'Personal branding · Fondatrice', platform:'tiktok', type:'perso' },
  'insta-wema':     { name:'Instagram', sub:'Wema Club', icon:'◉', color:'#00c896', desc:'Visibilité · Acquisition', platform:'instagram', type:'club' },
  'tiktok-wema':    { name:'TikTok', sub:'Wema Club', icon:'♪', color:'#00c896', desc:'Visibilité · Acquisition', platform:'tiktok', type:'club' },
};

const PERSONAS = {
  'linkedin-perso': {
    style:'Storytelling structuré, réflexion profonde, paragraphes courts',
    ton:'Posé, direct, incarné — jamais corporate',
    posture:'Experte qui partage son cheminement',
    sujets:'Décisions de fondatrice, vision leadership, communauté, création de liens',
    emotion:'6/10', regle:'80% fondatrice (décisions, doutes, déclics) · 20% quotidien',
    hook_type:'Question ou affirmation contre-intuitive en 1ère ligne',
    cta:'Ouverture au débat, question en fin de post',
  },
  'insta-perso': {
    style:'Incarnation, émotion, visuels texte courts',
    ton:'Chaud, proche, authentique',
    posture:'Toi, humaine, fondatrice dans la vie réelle',
    sujets:'Moments de vie, réflexions du quotidien, coulisses légères',
    emotion:'8/10', regle:'80% fondatrice · 20% quotidien/lifestyle',
    hook_type:'Visuel fort + caption courte impactante',
    cta:'Partage si tu te reconnais / Dis-moi en commentaire',
  },
  'tiktok-perso': {
    style:'Oral, rythme rapide, spontané, direct caméra',
    ton:'Cash, énergique, sans filtre',
    posture:'Toi qui parles à ton audience comme à une amie',
    sujets:'Opinions tranchées, vérités terrain, déclics entrepreneuriaux',
    emotion:'9/10', regle:'80% fondatrice (opinions, vérités) · 20% vie quotidienne',
    hook_type:'3 premières secondes = choc ou question forte',
    cta:"Commente / Abonne-toi si t'es concerné.e",
  },
  'insta-wema': {
    style:'Pédagogique, accessible, orienté communauté',
    ton:'Accueillant, collectif, bienveillant mais concret',
    posture:'Voix de la communauté · Guide doux',
    sujets:'Témoignages membres, enseignements des échanges, coulisses événements',
    emotion:'5/10', regle:"80% vie club (témoignages, échanges, events) · 20% humain/lien",
    hook_type:'Témoignage ou question de membre réelle',
    cta:'Rejoins la prochaine session / Inscris-toi',
  },
  'tiktok-wema': {
    style:'Court, dynamique, éducatif avec une touche fun',
    ton:'Accessible, collectif, motivant',
    posture:'Voix du club, invitation à rejoindre',
    sujets:'Temps forts des événements, mini-leçons issues des échanges, annonces',
    emotion:'6/10', regle:'80% vie club · 20% humain',
    hook_type:'Situation reconnaissable pour la cible',
    cta:'Lien en bio pour s\'inscrire',
  },
};

// ── STATE ────────────────────────────────────────────────
let currentAccount = 'linkedin-perso';
let currentModule = 'analyse';
let chartInstances = {};

// ── STORAGE ──────────────────────────────────────────────
const get = (k, d={}) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const statsKey = (acc, date) => `stats_${acc}_${date}`;
const postsKey = acc => `posts_${acc}`;

// ── GROQ API ─────────────────────────────────────────────
async function callGroq(prompt, systemPrompt = '') {
  const key = get('settings', {}).groqKey;
  if (!key) { showSettings(); throw new Error('Clé Groq manquante'); }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1500,
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Erreur Groq ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

function getPersona(account) {
  return get(`persona_${account}`, PERSONAS[account] || {});
}

function personaContext(account) {
  const acc = ACCOUNTS[account];
  const p = getPersona(account);
  return `COMPTE : ${acc.name} ${acc.sub}
PERSONA : ${acc.type === 'perso' ? 'Chaybia Maftaha, fondatrice UM Mentor & Wema Club. Je bâtis des communautés où les bonnes personnes se rencontrent pour grandir, collaborer et avancer.' : 'Wema Club, voix de la communauté'}
STYLE : ${p.style || ''}
TON : ${p.ton || ''}
POSTURE : ${p.posture || ''}
SUJETS : ${p.sujets || ''}
RÈGLE ÉDITORIALE : ${p.regle || ''}
TYPE DE HOOK : ${p.hook_type || ''}
CTA HABITUEL : ${p.cta || ''}`;
}

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateDateBadge();
  updateTopbar();
  bindAccountNav();
  bindModuleNav();
  checkSettings();
  renderModule();
  renderSettingsModal();
});

function updateDateBadge() {
  document.getElementById('dateBadge').textContent =
    new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' });
}

function bindAccountNav() {
  document.querySelectorAll('.account-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.account-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAccount = btn.dataset.account;
      updateTopbar();
      renderModule();
    });
  });
}

function bindModuleNav() {
  document.querySelectorAll('.module-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentModule = btn.dataset.module;
      renderModule();
    });
  });
}

function updateTopbar() {
  const acc = ACCOUNTS[currentAccount];
  const icon = document.getElementById('currentAccountIcon');
  icon.textContent = acc.icon;
  icon.style.background = acc.color + '22';
  icon.style.color = acc.color;
  document.getElementById('currentAccountName').textContent = `${acc.name} ${acc.sub}`;
  document.getElementById('currentAccountDesc').textContent = acc.desc;
}

function renderModule() {
  destroyCharts();
  const el = document.getElementById('content');
  const map = { analyse:renderAnalyse, idees:renderIdees, redaction:renderRedaction,
    simulation:renderSimulation, persona:renderPersona, calendrier:renderCalendrier,
    recyclage:renderRecyclage, miroir:renderMiroir };
  el.innerHTML = (map[currentModule] || (() => ''))();
  bindModuleEvents();
}

function destroyCharts() {
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch {} });
  chartInstances = {};
}

// ── SETTINGS ─────────────────────────────────────────────
function checkSettings() {
  const s = get('settings', {});
  if (!s.groqKey) setTimeout(showSettings, 500);
}

function renderSettingsModal() {
  const s = get('settings', {});
  const modal = document.createElement('div');
  modal.id = 'settingsModal';
  modal.className = 'modal-overlay';
  modal.style.display = 'none';
  modal.innerHTML = `
<div class="modal">
  <div class="modal-header">
    <span class="modal-title">⚙️ Configuration</span>
    <button class="modal-close" id="closeSettings">✕</button>
  </div>
  <div class="modal-body">
    <div class="form-group">
      <label class="form-label">Clé API Groq <span style="color:var(--text-faint)">(gratuite sur console.groq.com)</span></label>
      <input class="form-input" id="groqKeyInput" type="password" placeholder="gsk_..." value="${s.groqKey || ''}" />
      <div style="font-size:11px;color:var(--text-faint);margin-top:6px">
        Va sur <strong>console.groq.com</strong> → API Keys → Create API Key → copie la clé ici
      </div>
    </div>
    <div class="form-group" style="margin-top:20px">
      <label class="form-label">Ton prénom (pour personnaliser les réponses)</label>
      <input class="form-input" id="prenomInput" placeholder="Chaybia" value="${s.prenom || 'Chaybia'}" />
    </div>
  </div>
  <div class="btn-group" style="padding:0 24px 24px">
    <button class="btn btn-primary" id="saveSettings">Sauvegarder</button>
  </div>
</div>`;
  document.body.appendChild(modal);

  document.getElementById('saveSettings').addEventListener('click', () => {
    const key = document.getElementById('groqKeyInput').value.trim();
    const prenom = document.getElementById('prenomInput').value.trim();
    set('settings', { groqKey: key, prenom });
    modal.style.display = 'none';
    showToast('Configuration sauvegardée ✓');
  });

  document.getElementById('closeSettings').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  document.getElementById('settingsBtn').addEventListener('click', showSettings);
}

function showSettings() {
  document.getElementById('settingsModal').style.display = 'flex';
}

// ══════════════════════════════════════════════════════════
//  MODULE ANALYSE
// ══════════════════════════════════════════════════════════
function renderAnalyse() {
  const today = new Date().toISOString().split('T')[0];
  const stats = get(statsKey(currentAccount, today), { vues:'', likes:'', commentaires:'', partages:'', sauvegardes:'' });
  const posts = get(postsKey(currentAccount), []);
  const acc = ACCOUNTS[currentAccount];

  return `
<div class="section-title">📊 Analyse du jour <span class="badge">${acc.name} ${acc.sub}</span></div>

<div class="card" style="margin-bottom:20px">
  <div class="card-title">Stats du jour — ${new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}</div>
  <div class="stats-input-grid">
    ${['vues','likes','commentaires','partages','sauvegardes'].map(s=>`
    <div class="stat-input-card">
      <div class="form-label">${s.charAt(0).toUpperCase()+s.slice(1)}</div>
      <input class="form-input stat-field" data-field="${s}" type="number" placeholder="0" value="${stats[s]||''}" />
    </div>`).join('')}
  </div>
  <div class="btn-group">
    <button class="btn btn-primary" id="saveStatsBtn">Enregistrer + Analyser</button>
    <button class="btn btn-ghost" id="addPostBtn">+ Ajouter un post</button>
  </div>
</div>

<div id="aiAnalyseBox" class="ai-response-box" style="display:none"></div>

<div class="grid-2">
  <div class="card">
    <div class="card-title">Vues — 7 derniers jours</div>
    <div class="chart-container"><canvas id="chartVues"></canvas></div>
  </div>
  <div class="card">
    <div class="card-title">Engagement — 7 derniers jours</div>
    <div class="chart-container"><canvas id="chartEngagement"></canvas></div>
  </div>
</div>

<div class="card" id="addPostForm" style="display:none;margin-bottom:20px">
  <div class="card-title">Ajouter un post</div>
  <div class="form-group">
    <label class="form-label">Extrait / Hook du post</label>
    <textarea class="form-textarea" id="postText" placeholder="Colle le début de ton post ou décris-le..."></textarea>
  </div>
  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Format</label>
      <select class="form-select" id="postFormat">
        <option>Carrousel</option><option>Texte</option><option>Vidéo</option><option>Reel/Short</option><option>Image</option><option>Story</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Date</label>
      <input class="form-input" type="date" id="postDate" value="${today}" />
    </div>
  </div>
  <div class="form-row-3">
    ${['vues','likes','commentaires'].map(s=>`
    <div class="form-group">
      <label class="form-label">${s.charAt(0).toUpperCase()+s.slice(1)}</label>
      <input class="form-input" type="number" id="post_${s}" placeholder="0" />
    </div>`).join('')}
  </div>
  <div class="form-group">
    <label class="form-label">Sujet / Thème</label>
    <input class="form-input" id="postSujet" placeholder="Ex: décision fondatrice, doute, déclic..." />
  </div>
  <div class="btn-group">
    <button class="btn btn-primary" id="savePostBtn">Enregistrer le post</button>
    <button class="btn btn-ghost" id="cancelPostBtn">Annuler</button>
  </div>
</div>

<div class="section-title">Historique posts</div>
${posts.length === 0
  ? `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">Aucun post enregistré.<br>Clique sur "+ Ajouter un post" pour commencer.</div></div>`
  : posts.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10).map(p=>`
<div class="content-card">
  <div class="content-card-top">
    <div style="display:flex;gap:8px"><span class="tag tag-format">${p.format}</span>${p.sujet?`<span class="tag tag-objectif">${p.sujet}</span>`:''}</div>
    <span class="content-card-date">${new Date(p.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</span>
  </div>
  <div class="content-card-text">${p.text||'—'}</div>
  <div class="content-card-stats">
    <span class="content-card-stat">👁 <strong>${p.vues||0}</strong></span>
    <span class="content-card-stat">❤️ <strong>${p.likes||0}</strong></span>
    <span class="content-card-stat">💬 <strong>${p.commentaires||0}</strong></span>
  </div>
</div>`).join('')}`;
}

function getLast7Days() {
  return Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-6+i);
    const key = d.toISOString().split('T')[0];
    return { label: d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'}), ...get(statsKey(currentAccount,key),{}) };
  });
}

function initAnalyseCharts() {
  const days = getLast7Days();
  const acc = ACCOUNTS[currentAccount];
  const cfg = (data, label, color) => ({
    type:'line', data:{ labels:days.map(d=>d.label),
    datasets:[{ label, data, borderColor:color, backgroundColor:color+'22', fill:true, tension:0.4, pointBackgroundColor:color, pointRadius:4 }]},
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false} },
      scales:{ x:{grid:{color:'#2a2a35'},ticks:{color:'#7a7a90',font:{size:11}}},
               y:{grid:{color:'#2a2a35'},ticks:{color:'#7a7a90',font:{size:11}},beginAtZero:true} } }
  });
  const v = document.getElementById('chartVues');
  const e = document.getElementById('chartEngagement');
  if (v) chartInstances.vues = new Chart(v, cfg(days.map(d=>+d.vues||0),'Vues',acc.color));
  if (e) chartInstances.eng = new Chart(e, cfg(days.map(d=>(+d.likes||0)+(+d.commentaires||0)+(+d.partages||0)),'Engagement','#7c6cfc'));
}

async function analyseStatsWithAI(stats) {
  const acc = ACCOUNTS[currentAccount];
  const days = getLast7Days();
  const posts = get(postsKey(currentAccount), []).slice(-5);

  const prompt = `Tu es l'analyste social media de ${get('settings',{}).prenom||'Chaybia'}.

${personaContext(currentAccount)}

STATS D'AUJOURD'HUI :
- Vues : ${stats.vues||0}
- Likes : ${stats.likes||0}
- Commentaires : ${stats.commentaires||0}
- Partages : ${stats.partages||0}
- Sauvegardes : ${stats.sauvegardes||0}

HISTORIQUE 7 JOURS (vues) : ${days.map(d=>`${d.label}: ${d.vues||0}`).join(', ')}

${posts.length > 0 ? `DERNIERS POSTS :
${posts.map(p=>`- ${p.format} : "${p.text?.substring(0,60)||''}" (${p.vues||0} vues, ${p.likes||0} likes)`).join('\n')}` : ''}

ANALYSE EN 4 POINTS CONCIS :
1. 📈 Performance du jour (bonne/moyenne/faible + pourquoi en 1 phrase)
2. 🎯 Ce qui influence la perf (hook, sujet, format, timing, émotion)
3. ✅ Ce que tu dois reproduire
4. ⚠️ Ce que tu dois éviter

Termine par : "💡 Insight clé : [1 phrase actionnable]"

Sois directe, courte, sans fioritures.`;

  return callGroq(prompt);
}

// ══════════════════════════════════════════════════════════
//  MODULE IDÉES
// ══════════════════════════════════════════════════════════
function renderIdees() {
  const acc = ACCOUNTS[currentAccount];
  const ideas = get(`ideas_${currentAccount}`, []);

  return `
<div class="section-title">💡 Idées de contenu <span class="badge">${acc.name} ${acc.sub}</span></div>

<div class="card" style="margin-bottom:20px">
  <div class="card-title">Générer des idées</div>
  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Objectif</label>
      <select class="form-select" id="ideaObjectif">
        <option>Branding</option><option>Visibilité</option><option>Engagement</option>
        <option>Conversion</option><option>Autorité</option><option>Recrutement club</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Format souhaité</label>
      <select class="form-select" id="ideaFormat">
        <option>Libre</option><option>Carrousel</option><option>Post texte</option>
        <option>Vidéo courte</option><option>Story</option><option>Thread</option>
      </select>
    </div>
  </div>
  <div class="form-group">
    <label class="form-label">Thème ou sujet (optionnel)</label>
    <input class="form-input" id="ideaTheme" placeholder="Ex: le moment où j'ai décidé de créer Wema, doute face à une décision..." />
  </div>
  <button class="btn btn-primary" id="generateIdeaBtn">
    <span id="ideaBtnText">✨ Générer les idées</span>
  </button>
</div>

<div id="aiIdeasBox" class="ai-response-box" style="display:none"></div>

<div class="section-title" style="margin-top:24px">Idées sauvegardées</div>
${ideas.length === 0
  ? `<div class="empty-state"><div class="empty-icon">💡</div><div class="empty-text">Aucune idée sauvegardée.</div></div>`
  : ideas.slice().reverse().map((idea,i)=>`
<div class="content-card">
  <div class="content-card-top">
    <div style="display:flex;gap:8px"><span class="tag tag-objectif">${idea.objectif}</span><span class="tag tag-format">${idea.format}</span></div>
    <button class="btn btn-ghost" style="padding:3px 10px;font-size:11px" onclick="deleteIdea(${ideas.length-1-i})">✕</button>
  </div>
  <div class="content-card-text">${idea.theme||'Idée générée'}</div>
  ${idea.content ? `<div style="font-size:12px;color:var(--text-muted);margin-top:8px;white-space:pre-wrap">${idea.content.substring(0,200)}...</div>` : ''}
</div>`).join('')}`;
}

async function generateIdeasWithAI() {
  const acc = ACCOUNTS[currentAccount];
  const objectif = document.getElementById('ideaObjectif')?.value;
  const format = document.getElementById('ideaFormat')?.value;
  const theme = document.getElementById('ideaTheme')?.value;

  const prompt = `Tu es la directrice éditoriale de ${get('settings',{}).prenom||'Chaybia'}.

${personaContext(currentAccount)}

DEMANDE :
- Objectif : ${objectif}
- Format : ${format}
${theme ? `- Thème/sujet de départ : ${theme}` : '- Pas de thème imposé, sois créative'}

Génère 3 idées de posts CONCRÈTES et DIFFÉRENTES pour ce compte.

Pour chaque idée, donne :
**Idée [n] — [Titre accrocheur]**
- Angle : [l'approche unique de cette idée]
- Hook : [la première phrase ou accroche exacte]
- Pourquoi ça marche : [1 phrase]
- Intensité émotionnelle : [x/10]

Les idées doivent être dans l'univers de la fondatrice, pas génériques. Pas de liste plate, sois créative et spécifique.`;

  return callGroq(prompt);
}

window.deleteIdea = (i) => {
  const ideas = get(`ideas_${currentAccount}`, []);
  ideas.splice(i,1);
  set(`ideas_${currentAccount}`, ideas);
  renderModule();
};

// ══════════════════════════════════════════════════════════
//  MODULE RÉDACTION
// ══════════════════════════════════════════════════════════
function renderRedaction() {
  const acc = ACCOUNTS[currentAccount];
  return `
<div class="section-title">✍️ Rédaction <span class="badge">${acc.name} ${acc.sub}</span></div>

<div class="card" style="margin-bottom:20px">
  <div class="card-title">Paramètres du contenu</div>
  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Intention</label>
      <select class="form-select" id="redIntention">
        <option>Branding / Qui je suis</option>
        <option>Partage d'expérience</option>
        <option>Opinion / Prise de position</option>
        <option>Déclic / Enseignement</option>
        <option>Coulisses</option>
        <option>Annonce / Invitation</option>
        <option>Témoignage membre</option>
        <option>Contenu miroir (universel)</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Format</label>
      <select class="form-select" id="redFormat">
        <option>Post texte</option><option>Carrousel (script)</option>
        <option>Script vidéo</option><option>Caption courte</option>
        <option>Story (suite)</option><option>Thread</option>
      </select>
    </div>
  </div>
  <div class="form-group">
    <label class="form-label">Ton sujet / idée de base</label>
    <textarea class="form-textarea" id="redSujet" placeholder="Décris ton idée, l'histoire, le moment, la décision... Plus tu es précise, meilleur est le résultat."></textarea>
  </div>
  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Inclure (optionnel)</label>
      <input class="form-input" id="redInclure" placeholder="Une date, une anecdote, un chiffre..." />
    </div>
    <div class="form-group">
      <label class="form-label">Éviter</label>
      <input class="form-input" id="redEviter" placeholder="Trop d'émotion, mention directe du club..." />
    </div>
  </div>
  <div style="margin-bottom:20px">
    <div class="card-title">Calibrage du ton</div>
    <div class="slider-group">
      <div class="slider-row"><span class="slider-label">Émotion</span><input type="range" class="slider" id="sliderEmotion" min="1" max="10" value="6" oninput="document.getElementById('valEmotion').textContent=this.value"><span class="slider-val" id="valEmotion">6</span></div>
      <div class="slider-row" style="margin-top:10px"><span class="slider-label">Storytelling</span><input type="range" class="slider" id="sliderStory" min="1" max="10" value="7" oninput="document.getElementById('valStory').textContent=this.value"><span class="slider-val" id="valStory">7</span></div>
      <div class="slider-row" style="margin-top:10px"><span class="slider-label">Directivité</span><input type="range" class="slider" id="sliderDir" min="1" max="10" value="5" oninput="document.getElementById('valDir').textContent=this.value"><span class="slider-val" id="valDir">5</span></div>
    </div>
  </div>
  <button class="btn btn-primary" id="generateRedBtn">✨ Rédiger le contenu</button>
</div>

<div id="aiRedBox" class="ai-response-box" style="display:none"></div>`;
}

async function generateRedactionWithAI() {
  const acc = ACCOUNTS[currentAccount];
  const intention = document.getElementById('redIntention')?.value;
  const format = document.getElementById('redFormat')?.value;
  const sujet = document.getElementById('redSujet')?.value;
  const inclure = document.getElementById('redInclure')?.value;
  const eviter = document.getElementById('redEviter')?.value;
  const emotion = document.getElementById('sliderEmotion')?.value||6;
  const story = document.getElementById('sliderStory')?.value||7;
  const dir = document.getElementById('sliderDir')?.value||5;

  const prompt = `Tu vas rédiger un contenu pour ${get('settings',{}).prenom||'Chaybia'}.

${personaContext(currentAccount)}

CALIBRAGE :
- Niveau émotion : ${emotion}/10
- Niveau storytelling : ${story}/10
- Niveau directivité : ${dir}/10

CONTENU À RÉDIGER :
- Intention : ${intention}
- Format : ${format}
- Sujet/Idée : ${sujet}
${inclure ? `- À inclure : ${inclure}` : ''}
${eviter ? `- À éviter : ${eviter}` : ''}

RÈGLES ABSOLUES :
- Écris comme Chaybia parle, pas comme une IA
- Pas de hashtags dans le corps du texte
- Pas de "Dans un monde où...", pas de généralités
${acc.platform === 'linkedin' ? '- Phrases courtes, retours à la ligne fréquents\n- Structure : hook fort / développement / chute ou question' : ''}
${acc.platform === 'tiktok' ? '- Style oral, rythme, spontané — comme si tu parlais à la caméra\n- Commence fort, garde l\'énergie' : ''}
${acc.platform === 'instagram' ? '- Caption incarnée, proche, visuellement aérée\n- Premiere ligne = hook visuel' : ''}

Donne :
**VERSION PRINCIPALE :**
[Le contenu complet, prêt à publier]

---
**VARIANTE (angle légèrement différent) :**
[Une alternative courte]`;

  return callGroq(prompt);
}

// ══════════════════════════════════════════════════════════
//  MODULE SIMULATION
// ══════════════════════════════════════════════════════════
function renderSimulation() {
  const acc = ACCOUNTS[currentAccount];
  return `
<div class="section-title">🚨 Simulation de performance <span class="badge">${acc.name} ${acc.sub}</span></div>

<div class="card" style="margin-bottom:20px">
  <div class="card-title">Évalue ton contenu avant publication</div>
  <div class="form-group">
    <label class="form-label">Colle ton contenu complet</label>
    <textarea class="form-textarea" id="simContent" placeholder="Colle ton post, script ou caption complet..." style="min-height:160px"></textarea>
  </div>
  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Format</label>
      <select class="form-select" id="simFormat">
        <option>Post texte</option><option>Carrousel</option><option>Vidéo/Reel</option><option>Story</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Intention</label>
      <select class="form-select" id="simIntention">
        <option>Branding</option><option>Engagement</option><option>Visibilité</option><option>Conversion</option>
      </select>
    </div>
  </div>
  <button class="btn btn-primary" id="generateSimBtn">🔍 Analyser maintenant</button>
</div>

<div id="aiSimBox" class="ai-response-box" style="display:none"></div>`;
}

async function generateSimulationWithAI() {
  const acc = ACCOUNTS[currentAccount];
  const content = document.getElementById('simContent')?.value;
  const format = document.getElementById('simFormat')?.value;
  const intention = document.getElementById('simIntention')?.value;

  const prompt = `Tu es la directrice éditoriale de ${get('settings',{}).prenom||'Chaybia'}. Analyse ce contenu avant publication.

${personaContext(currentAccount)}

FORMAT : ${format}
INTENTION : ${intention}

CONTENU :
---
${content}
---

ANALYSE COMPLÈTE :

🎯 **SCORE : [X/10]**
[Justification en 1 phrase]

💪 **FORCES (ce qui fonctionne)**
- [Force 1]
- [Force 2]
- [Force 3 si applicable]

⚠️ **FAIBLESSES (ce qui peut freiner)**
- [Faiblesse 1]
- [Faiblesse 2 si applicable]

🔧 **AMÉLIORATIONS CONCRÈTES**
[Réécris la partie faible directement, ne dis pas juste "améliore ça"]

📊 **ESTIMATION**
- Engagement estimé : [faible/moyen/fort]
- Risque de passer inaperçu : [oui/non + pourquoi]
- Potentiel viral : [oui/non + pourquoi]

Sois directe, précise, actionnable.`;

  return callGroq(prompt);
}

// ══════════════════════════════════════════════════════════
//  MODULE PERSONA
// ══════════════════════════════════════════════════════════
function renderPersona() {
  const acc = ACCOUNTS[currentAccount];
  const persona = get(`persona_${currentAccount}`, PERSONAS[currentAccount]||{});
  const fields = [
    {key:'style',label:"Style d'écriture"},{key:'ton',label:'Ton'},{key:'posture',label:'Posture'},
    {key:'sujets',label:'Sujets récurrents'},{key:'emotion',label:'Niveau émotionnel'},
    {key:'regle',label:'Règle éditoriale 80/20'},{key:'hook_type',label:'Type de hook'},{key:'cta',label:'CTA habituel'},
  ];

  return `
<div class="section-title">🧠 Persona <span class="badge">${acc.name} ${acc.sub}</span></div>
<div class="card" style="margin-bottom:20px;border-left:3px solid ${acc.color}">
  <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px">Ces données alimentent automatiquement l'IA dans tous les modules.</div>
  <div class="persona-grid">
    ${fields.map(f=>`
    <div class="persona-item">
      <div class="persona-item-label">${f.label}</div>
      <textarea class="form-textarea persona-field" data-key="${f.key}" style="min-height:55px;font-size:13px">${persona[f.key]||''}</textarea>
    </div>`).join('')}
  </div>
  <div class="btn-group">
    <button class="btn btn-primary" id="savePersonaBtn">Sauvegarder</button>
    <button class="btn btn-ghost" id="resetPersonaBtn">Réinitialiser</button>
  </div>
</div>`;
}

// ══════════════════════════════════════════════════════════
//  MODULE CALENDRIER
// ══════════════════════════════════════════════════════════
function renderCalendrier() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  const allPosts = {};
  Object.keys(ACCOUNTS).forEach(acc => {
    get(postsKey(acc),[]).forEach(p => {
      if (!allPosts[p.date]) allPosts[p.date]=[];
      allPosts[p.date].push({...p,account:acc});
    });
  });

  const calEvents = get('cal_events',[]);
  let calHtml = '';
  for (let i=0;i<7;i++) {
    const d=new Date(startOfWeek); d.setDate(startOfWeek.getDate()+i);
    const dateStr=d.toISOString().split('T')[0];
    const isToday=dateStr===today.toISOString().split('T')[0];
    const posts=allPosts[dateStr]||[];
    const events=calEvents.filter(e=>e.date===dateStr);
    calHtml+=`<div class="cal-day ${isToday?'today':''}">
      <div class="cal-day-num">${d.getDate()}</div>
      ${posts.map(p=>{const a=ACCOUNTS[p.account];return `<div class="cal-post-pill" style="background:${a?.color}22;color:${a?.color}">${a?.icon} ${p.format}</div>`;}).join('')}
      ${events.map(e=>`<div class="cal-post-pill" style="background:var(--accent-glow);color:var(--accent)">${e.text}</div>`).join('')}
    </div>`;
  }

  return `
<div class="section-title">📅 Calendrier — Semaine du ${startOfWeek.toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}</div>
<div class="card" style="margin-bottom:20px">
  <div class="cal-grid">
    ${days.map(d=>`<div class="cal-day-header">${d}</div>`).join('')}
    ${calHtml}
  </div>
</div>
<div class="card" style="margin-bottom:20px">
  <div class="card-title">Ajouter un contenu planifié</div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">Date</label><input class="form-input" type="date" id="calDate" value="${today.toISOString().split('T')[0]}" /></div>
    <div class="form-group"><label class="form-label">Contenu / Note</label><input class="form-input" id="calText" placeholder="Ex: Post LinkedIn fondatrice, Reel Wema..." /></div>
  </div>
  <button class="btn btn-primary" id="addCalEventBtn">Ajouter</button>
</div>
<div class="card">
  <div class="card-title">Vue d'ensemble</div>
  ${Object.keys(ACCOUNTS).map(acc=>{
    const posts=get(postsKey(acc),[]);
    const week=posts.filter(p=>{const d=new Date(p.date);return d>=startOfWeek&&d<=today;});
    const a=ACCOUNTS[acc];
    return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
      <span style="width:28px;height:28px;border-radius:6px;background:${a.color}22;color:${a.color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${a.icon}</span>
      <span style="flex:1;font-size:13px">${a.name} ${a.sub}</span>
      <span style="font-size:12px;color:var(--text-muted)">${week.length} post${week.length>1?'s':''} cette semaine</span>
    </div>`;
  }).join('')}
</div>`;
}

// ══════════════════════════════════════════════════════════
//  MODULE RECYCLAGE
// ══════════════════════════════════════════════════════════
function renderRecyclage() {
  return `
<div class="section-title">🔁 Recyclage intelligent</div>
<div class="card" style="margin-bottom:20px">
  <div class="card-title">Adapter un contenu existant</div>
  <div class="form-group">
    <label class="form-label">Contenu source</label>
    <textarea class="form-textarea" id="recycContent" placeholder="Colle le contenu original..." style="min-height:120px"></textarea>
  </div>
  <div class="form-group">
    <label class="form-label">Plateforme source</label>
    <select class="form-select" id="recycSource">
      <option>LinkedIn Perso</option><option>Instagram Perso</option><option>TikTok Perso</option>
      <option>Instagram Wema</option><option>TikTok Wema</option><option>Autre</option>
    </select>
  </div>
  <div class="form-group">
    <label class="form-label">Adapter pour</label>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
      ${Object.entries(ACCOUNTS).map(([key,a])=>`
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border);border-radius:6px;font-size:12px">
        <input type="checkbox" class="recycle-target" value="${key}" style="accent-color:${a.color}">
        <span style="color:${a.color}">${a.icon}</span> ${a.name} ${a.sub}
      </label>`).join('')}
    </div>
  </div>
  <div class="form-group">
    <label class="form-label">Instruction spécifique (optionnel)</label>
    <input class="form-input" id="recycInstruction" placeholder="Ex: simplifier, rendre plus émotionnel, adapter pour l'oral..." />
  </div>
  <button class="btn btn-primary" id="generateRecycBtn">✨ Recycler maintenant</button>
</div>
<div id="aiRecycBox" class="ai-response-box" style="display:none"></div>`;
}

async function generateRecyclageWithAI() {
  const content = document.getElementById('recycContent')?.value;
  const source = document.getElementById('recycSource')?.value;
  const instruction = document.getElementById('recycInstruction')?.value;
  const targets = [...document.querySelectorAll('.recycle-target:checked')].map(cb => {
    const acc = ACCOUNTS[cb.value];
    const p = getPersona(cb.value);
    return `\n### ${acc.name} ${acc.sub}\nStyle : ${p.style||'—'} | Ton : ${p.ton||'—'} | Règle : ${p.regle||'—'} | Format adapté : ${acc.platform==='tiktok'?'Script oral':acc.platform==='instagram'?'Caption':'Post texte'}`;
  }).join('');

  if (!targets) { showToast('Sélectionne au moins un compte cible'); return null; }

  const prompt = `Tu adaptes du contenu pour ${get('settings',{}).prenom||'Chaybia'}.

CONTENU ORIGINAL (depuis : ${source}) :
---
${content}
---
${instruction ? `\nINSTRUCTION : ${instruction}` : ''}

ADAPTE POUR CES COMPTES :
${targets}

Pour chaque compte, produis une version COMPLÈTE et PRÊTE À PUBLIER.
Respecte l'identité éditoriale de chaque compte. Ne copie pas — réinterprète.
TikTok = oral. Instagram = incarné. LinkedIn = structuré.`;

  return callGroq(prompt);
}

// ══════════════════════════════════════════════════════════
//  MODULE MIROIR
// ══════════════════════════════════════════════════════════
function renderMiroir() {
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate()-7);
  const allData = Object.keys(ACCOUNTS).map(acc => {
    const posts = get(postsKey(acc),[]);
    const week = posts.filter(p => new Date(p.date) >= weekAgo);
    return { acc, name:ACCOUNTS[acc].name+' '+ACCOUNTS[acc].sub, posts:week, total:posts.length };
  });
  const totalWeek = allData.reduce((s,d)=>s+d.posts.length,0);

  return `
<div class="section-title">🪞 Miroir stratégique hebdo</div>
<div class="grid-3" style="margin-bottom:20px">
  <div class="stat-card"><div class="stat-label">Posts cette semaine</div><div class="stat-value">${totalWeek}</div><div class="stat-delta neutral">tous comptes</div></div>
  <div class="stat-card"><div class="stat-label">Comptes actifs</div><div class="stat-value">${allData.filter(d=>d.posts.length>0).length} / 5</div></div>
  <div class="stat-card"><div class="stat-label">Total posts enregistrés</div><div class="stat-value">${allData.reduce((s,d)=>s+d.total,0)}</div></div>
</div>
<div class="grid-2" style="margin-bottom:20px">
  ${allData.map(d=>`
  <div class="card">
    <div class="card-title" style="color:${ACCOUNTS[d.acc].color}">${d.name}</div>
    <div style="font-size:28px;font-weight:800">${d.posts.length} <span style="font-size:14px;font-weight:400;color:var(--text-muted)">posts / semaine</span></div>
    <div style="font-size:12px;color:var(--text-faint);margin-top:6px">${d.posts.length?`Formats : ${[...new Set(d.posts.map(p=>p.format))].join(', ')}`:'Aucun post cette semaine'}</div>
  </div>`).join('')}
</div>
<button class="btn btn-primary" id="generateMiroirBtn" style="margin-bottom:20px">🪞 Générer le bilan stratégique</button>
<div id="aiMiroirBox" class="ai-response-box" style="display:none"></div>`;
}

async function generateMiroirWithAI() {
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate()-7);
  const allData = Object.keys(ACCOUNTS).map(acc => {
    const posts = get(postsKey(acc),[]);
    const week = posts.filter(p => new Date(p.date) >= weekAgo);
    return { acc, name:ACCOUNTS[acc].name+' '+ACCOUNTS[acc].sub, posts:week };
  });

  const summary = allData.map(d =>
    `${d.name} : ${d.posts.length} post(s) ${d.posts.length ? '→ '+d.posts.map(p=>p.format+(p.sujet?` (${p.sujet})`:'')+(p.vues?` — ${p.vues} vues`:'')).join(', ') : '→ aucun'}`
  ).join('\n');

  const prompt = `Tu es la directrice de contenu de ${get('settings',{}).prenom||'Chaybia'}.

POSITIONNEMENT : Fondatrice de UM Mentor & Wema Club. Je bâtis des communautés où les bonnes personnes se rencontrent pour grandir, collaborer et avancer.

BILAN DE LA SEMAINE :
${summary}

ANALYSE STRATÉGIQUE EN 4 PARTIES :

🔄 **CE QUI A CHANGÉ CETTE SEMAINE**
[Évolutions dans le contenu, la fréquence, les sujets]

🏆 **CE QUI MARCHE LE MIEUX**
[Compte, format, sujet qui performe + pourquoi]

🎯 **COHÉRENCE GLOBALE**
[Est-ce que les messages entre comptes sont cohérents ? Y a-t-il des contradictions ?]

🪞 **CE QUE TON CONTENU DIT DE TOI SANS QUE TU T'EN RENDES COMPTE**
[Lecture entre les lignes — ce que l'audience perçoit vraiment]

---
💡 **INSIGHT CLÉ DE LA SEMAINE** : [1 phrase]
⚡ **DÉSÉQUILIBRE À CORRIGER** : [1 action concrète]
📌 **TYPE DE CONTENU MANQUANT** : [Ce qui manque pour équilibrer la semaine]`;

  return callGroq(prompt);
}

// ══════════════════════════════════════════════════════════
//  BIND EVENTS
// ══════════════════════════════════════════════════════════
function bindModuleEvents() {
  const today = new Date().toISOString().split('T')[0];

  if (currentModule === 'analyse') {
    initAnalyseCharts();

    document.getElementById('saveStatsBtn')?.addEventListener('click', async () => {
      const stats = {};
      document.querySelectorAll('.stat-field').forEach(el => { stats[el.dataset.field] = el.value; });
      set(statsKey(currentAccount, today), stats);
      destroyCharts(); initAnalyseCharts();
      showToast('Stats enregistrées ✓');
      await runAI('aiAnalyseBox', () => analyseStatsWithAI(stats), 'saveStatsBtn', 'Enregistrer + Analyser');
    });

    document.getElementById('addPostBtn')?.addEventListener('click', () => {
      const f = document.getElementById('addPostForm');
      f.style.display = f.style.display==='none' ? 'block' : 'none';
    });
    document.getElementById('cancelPostBtn')?.addEventListener('click', () => {
      document.getElementById('addPostForm').style.display='none';
    });
    document.getElementById('savePostBtn')?.addEventListener('click', () => {
      const posts = get(postsKey(currentAccount),[]);
      posts.push({
        text:document.getElementById('postText')?.value,
        format:document.getElementById('postFormat')?.value,
        date:document.getElementById('postDate')?.value||today,
        vues:document.getElementById('post_vues')?.value,
        likes:document.getElementById('post_likes')?.value,
        commentaires:document.getElementById('post_commentaires')?.value,
        sujet:document.getElementById('postSujet')?.value,
      });
      set(postsKey(currentAccount), posts);
      showToast('Post enregistré ✓');
      renderModule();
    });
  }

  if (currentModule === 'idees') {
    document.getElementById('generateIdeaBtn')?.addEventListener('click', async () => {
      const result = await runAI('aiIdeasBox', generateIdeasWithAI, 'generateIdeaBtn', '✨ Générer les idées');
      if (result) {
        const ideas = get(`ideas_${currentAccount}`,[]);
        ideas.push({
          objectif: document.getElementById('ideaObjectif')?.value,
          format: document.getElementById('ideaFormat')?.value,
          theme: document.getElementById('ideaTheme')?.value||'Idée générée',
          content: result,
          date: today,
        });
        set(`ideas_${currentAccount}`, ideas);
      }
    });
  }

  if (currentModule === 'redaction') {
    document.getElementById('generateRedBtn')?.addEventListener('click', async () => {
      await runAI('aiRedBox', generateRedactionWithAI, 'generateRedBtn', '✨ Rédiger le contenu');
    });
  }

  if (currentModule === 'simulation') {
    document.getElementById('generateSimBtn')?.addEventListener('click', async () => {
      await runAI('aiSimBox', generateSimulationWithAI, 'generateSimBtn', '🔍 Analyser maintenant');
    });
  }

  if (currentModule === 'persona') {
    document.getElementById('savePersonaBtn')?.addEventListener('click', () => {
      const persona = {};
      document.querySelectorAll('.persona-field').forEach(el => { persona[el.dataset.key]=el.value; });
      set(`persona_${currentAccount}`, persona);
      showToast('Persona sauvegardé ✓');
    });
    document.getElementById('resetPersonaBtn')?.addEventListener('click', () => {
      set(`persona_${currentAccount}`, PERSONAS[currentAccount]||{});
      showToast('Réinitialisé');
      renderModule();
    });
  }

  if (currentModule === 'calendrier') {
    document.getElementById('addCalEventBtn')?.addEventListener('click', () => {
      const events = get('cal_events',[]);
      const text = document.getElementById('calText')?.value;
      const date = document.getElementById('calDate')?.value;
      if (text && date) { events.push({text,date}); set('cal_events',events); showToast('Ajouté ✓'); renderModule(); }
    });
  }

  if (currentModule === 'recyclage') {
    document.getElementById('generateRecycBtn')?.addEventListener('click', async () => {
      await runAI('aiRecycBox', generateRecyclageWithAI, 'generateRecycBtn', '✨ Recycler maintenant');
    });
  }

  if (currentModule === 'miroir') {
    document.getElementById('generateMiroirBtn')?.addEventListener('click', async () => {
      await runAI('aiMiroirBox', generateMiroirWithAI, 'generateMiroirBtn', '🪞 Générer le bilan stratégique');
    });
  }
}

// ── HELPER : lancer une requête IA + afficher le résultat ──
async function runAI(boxId, fn, btnId, btnOriginalText) {
  const box = document.getElementById(boxId);
  const btn = document.getElementById(btnId);
  if (!box || !btn) return null;

  box.style.display = 'block';
  box.innerHTML = `<div class="ai-loading"><div class="ai-spinner"></div><span>L'IA analyse...</span></div>`;
  btn.disabled = true;
  btn.textContent = '⏳ En cours...';
  box.scrollIntoView({ behavior:'smooth', block:'nearest' });

  try {
    const result = await fn();
    if (!result) { box.style.display='none'; btn.disabled=false; btn.textContent=btnOriginalText; return null; }
    box.innerHTML = `
<div class="ai-response-header">
  <span style="font-size:12px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.8px">Réponse IA</span>
  <button class="copy-btn" onclick="copyAI('${boxId}')">Copier</button>
</div>
<div class="ai-response-content" id="${boxId}_content">${markdownToHtml(result)}</div>`;
    btn.disabled = false;
    btn.textContent = btnOriginalText;
    return result;
  } catch(e) {
    box.innerHTML = `<div class="ai-error">❌ ${e.message}${e.message.includes('401')||e.message.includes('auth')||e.message.includes('key') ? ' — Vérifie ta clé Groq dans les paramètres' : ''}</div>`;
    btn.disabled = false;
    btn.textContent = btnOriginalText;
    if (e.message.includes('Clé Groq')) showSettings();
    return null;
  }
}

window.copyAI = (boxId) => {
  const el = document.getElementById(`${boxId}_content`);
  if (!el) return;
  navigator.clipboard.writeText(el.innerText).then(() => showToast('Copié ✓'));
};

function markdownToHtml(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/^#{1,3} (.+)/gm,'<div class="ai-heading">$1</div>')
    .replace(/^---$/gm,'<hr style="border-color:var(--border);margin:16px 0">')
    .replace(/\n/g,'<br>');
}

// ── UTILS ────────────────────────────────────────────────
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t=document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = 'toast success';
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => t.classList.remove('show'), 2500);
}

updateTopbar();
