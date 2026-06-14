// ══════════════════════════════════════════════════════════
//  SOCIAL DASHBOARD — Chaybia Maftaha
//  5 comptes · 8 modules · 100% local storage
// ══════════════════════════════════════════════════════════

// ── CONFIG COMPTES ──────────────────────────────────────
const ACCOUNTS = {
  'linkedin-perso': {
    name: 'LinkedIn',
    sub: 'Perso',
    icon: 'in',
    color: '#0077b5',
    desc: 'Personal branding · Fondatrice',
    platform: 'linkedin',
    type: 'perso',
  },
  'insta-perso': {
    name: 'Instagram',
    sub: 'Perso',
    icon: '◉',
    color: '#e1306c',
    desc: 'Personal branding · Fondatrice',
    platform: 'instagram',
    type: 'perso',
  },
  'tiktok-perso': {
    name: 'TikTok',
    sub: 'Perso',
    icon: '♪',
    color: '#ff0050',
    desc: 'Personal branding · Fondatrice',
    platform: 'tiktok',
    type: 'perso',
  },
  'insta-wema': {
    name: 'Instagram',
    sub: 'Wema Club',
    icon: '◉',
    color: '#00c896',
    desc: 'Visibilité · Acquisition',
    platform: 'instagram',
    type: 'club',
  },
  'tiktok-wema': {
    name: 'TikTok',
    sub: 'Wema Club',
    icon: '♪',
    color: '#00c896',
    desc: 'Visibilité · Acquisition',
    platform: 'tiktok',
    type: 'club',
  },
};

// ── PERSONAS PAR COMPTE ──────────────────────────────────
const PERSONAS_DEFAULT = {
  'linkedin-perso': {
    style: 'Storytelling structuré, réflexion profonde, paragraphes courts',
    ton: 'Posé, direct, incarné — jamais corporate',
    posture: 'Experte qui partage son cheminement',
    sujets: 'Décisions de fondatrice, vision leadership, communauté, création de liens',
    emotion: '6/10 — présente mais maîtrisée',
    regle: '80% fondatrice (décisions, doutes, déclics) · 20% quotidien',
    hook_type: 'Question ou affirmation contre-intuitive en 1ère ligne',
    cta: 'Ouverture au débat, question en fin de post',
  },
  'insta-perso': {
    style: 'Incarnation, émotion, visuels texte courts',
    ton: 'Chaud, proche, authentique',
    posture: 'Toi, humaine, fondatrice dans la vie réelle',
    sujets: 'Moments de vie, réflexions du quotidien, coulisses legères',
    emotion: '8/10 — fort et sincère',
    regle: '80% fondatrice · 20% quotidien/lifestyle',
    hook_type: 'Visuel fort + caption courte impactante',
    cta: 'Partage si tu te reconnais / Dis-moi en commentaire',
  },
  'tiktok-perso': {
    style: 'Oral, rythme rapide, spontané, direct caméra',
    ton: 'Cash, énergique, sans filtre',
    posture: 'Toi qui parles à ton audience comme à une amie',
    sujets: 'Opinions tranchées, vérités terrain, déclics entrepreneuriaux',
    emotion: '9/10 — maximal, crédible',
    regle: '80% fondatrice (opinions, vérités) · 20% vie quotidienne',
    hook_type: '3 premières secondes = choc ou question forte',
    cta: 'Commente / Abonne-toi si t\'es concerné.e',
  },
  'insta-wema': {
    style: 'Pédagogique, accessible, orienté communauté',
    ton: 'Accueillant, collectif, bienveillant mais concret',
    posture: 'Voix de la communauté · Guide doux',
    sujets: 'Témoignages membres, enseignements des échanges, coulisses événements',
    emotion: '5/10 — chaleureux mais pas personnel',
    regle: '80% vie club (témoignages, échanges, events) · 20% humain/lien',
    hook_type: 'Témoignage ou question de membre réelle',
    cta: 'Rejoins la prochaine session / Inscris-toi',
  },
  'tiktok-wema': {
    style: 'Court, dynamique, éducatif avec une touche fun',
    ton: 'Accessible, collectif, motivant',
    posture: 'Voix du club, invitation à rejoindre',
    sujets: 'Temps forts des événements, mini-leçons issues des échanges, annonces',
    emotion: '6/10 — engagé et positif',
    regle: '80% vie club · 20% humain',
    hook_type: 'Situation reconnaissable pour la cible',
    cta: 'Lien en bio pour s\'inscrire',
  },
};

// ── STATE ───────────────────────────────────────────────
let currentAccount = 'linkedin-perso';
let currentModule = 'analyse';
let chartInstances = {};

function getData(key, fallback = {}) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function setData(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function statsKey(account, date) {
  return `stats_${account}_${date}`;
}

function postsKey(account) {
  return `posts_${account}`;
}

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateDateBadge();
  bindAccountNav();
  bindModuleNav();
  renderModule();
});

function updateDateBadge() {
  const d = new Date();
  document.getElementById('dateBadge').textContent =
    d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
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
  document.getElementById('currentAccountIcon').textContent = acc.icon;
  document.getElementById('currentAccountIcon').style.background = acc.color + '22';
  document.getElementById('currentAccountIcon').style.color = acc.color;
  document.getElementById('currentAccountName').textContent = `${acc.name} ${acc.sub}`;
  document.getElementById('currentAccountDesc').textContent = acc.desc;
}

function renderModule() {
  destroyCharts();
  const content = document.getElementById('content');
  switch (currentModule) {
    case 'analyse':    content.innerHTML = renderAnalyse(); break;
    case 'idees':      content.innerHTML = renderIdees(); break;
    case 'redaction':  content.innerHTML = renderRedaction(); break;
    case 'simulation': content.innerHTML = renderSimulation(); break;
    case 'persona':    content.innerHTML = renderPersona(); break;
    case 'calendrier': content.innerHTML = renderCalendrier(); break;
    case 'recyclage':  content.innerHTML = renderRecyclage(); break;
    case 'miroir':     content.innerHTML = renderMiroir(); break;
  }
  bindModuleEvents();
}

function destroyCharts() {
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch {} });
  chartInstances = {};
}

// ══════════════════════════════════════════════════════════
//  MODULE ANALYSE
// ══════════════════════════════════════════════════════════
function renderAnalyse() {
  const today = new Date().toISOString().split('T')[0];
  const stats = getData(statsKey(currentAccount, today), {
    vues: '', likes: '', commentaires: '', partages: '', sauvegardes: ''
  });
  const posts = getData(postsKey(currentAccount), []);
  const acc = ACCOUNTS[currentAccount];

  const recentStats = getLast7DaysStats();

  return `
<div class="section-title">
  📊 Analyse du jour
  <span class="badge">${acc.name} ${acc.sub}</span>
</div>

<!-- SAISIE STATS -->
<div class="card" style="margin-bottom:24px">
  <div class="card-title">Stats du jour — ${new Date().toLocaleDateString('fr-FR', {day:'numeric',month:'long'})}</div>
  <div class="stats-input-grid">
    ${['vues','likes','commentaires','partages','sauvegardes'].map(s => `
    <div class="stat-input-card">
      <div class="form-label">${s.charAt(0).toUpperCase()+s.slice(1)}</div>
      <input class="form-input stat-field" data-field="${s}" type="number" placeholder="0" value="${stats[s] || ''}" />
    </div>`).join('')}
  </div>
  <div class="btn-group">
    <button class="btn btn-primary" id="saveStatsBtn">Enregistrer</button>
    <button class="btn btn-ghost" id="addPostBtn">+ Ajouter un post</button>
  </div>
</div>

<!-- GRAPHIQUE 7 JOURS -->
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

<!-- FORM AJOUT POST -->
<div class="card" id="addPostForm" style="display:none;margin-bottom:24px">
  <div class="card-title">Nouveau post</div>
  <div class="form-group">
    <label class="form-label">Extrait / Hook</label>
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
    <input class="form-input" id="postSujet" placeholder="Ex: décision de fondatrice, doute, déclic..." />
  </div>
  <div class="btn-group">
    <button class="btn btn-primary" id="savePostBtn">Sauvegarder le post</button>
    <button class="btn btn-ghost" id="cancelPostBtn">Annuler</button>
  </div>
</div>

<!-- POSTS -->
<div class="section-title" style="margin-top:8px">Historique posts</div>
${posts.length === 0
  ? `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">Aucun post enregistré pour ce compte.<br>Clique sur "+ Ajouter un post" pour commencer.</div></div>`
  : posts.sort((a,b) => b.date.localeCompare(a.date)).slice(0,10).map(p => `
<div class="content-card">
  <div class="content-card-top">
    <div style="display:flex;gap:8px;align-items:center">
      <span class="tag tag-format">${p.format}</span>
      ${p.sujet ? `<span class="tag tag-objectif">${p.sujet}</span>` : ''}
    </div>
    <span class="content-card-date">${new Date(p.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</span>
  </div>
  <div class="content-card-text">${p.text || '—'}</div>
  <div class="content-card-stats">
    <span class="content-card-stat">👁 <strong>${p.vues||0}</strong></span>
    <span class="content-card-stat">❤️ <strong>${p.likes||0}</strong></span>
    <span class="content-card-stat">💬 <strong>${p.commentaires||0}</strong></span>
  </div>
</div>`).join('')}
`;
}

function getLast7DaysStats() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const stats = getData(statsKey(currentAccount, key), {});
    days.push({ date: d.toLocaleDateString('fr-FR', {day:'numeric',month:'short'}), ...stats });
  }
  return days;
}

function initAnalyseCharts() {
  const days = getLast7DaysStats();
  const labels = days.map(d => d.date);
  const acc = ACCOUNTS[currentAccount];

  const chartConfig = (data, label, color) => ({
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: color,
        backgroundColor: color + '22',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color,
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: '#2a2a35' }, ticks: { color: '#7a7a90', font: { size: 11 } } },
        y: { grid: { color: '#2a2a35' }, ticks: { color: '#7a7a90', font: { size: 11 } }, beginAtZero: true }
      }
    }
  });

  const vuesCtx = document.getElementById('chartVues');
  const engCtx = document.getElementById('chartEngagement');

  if (vuesCtx) chartInstances.vues = new Chart(vuesCtx, chartConfig(days.map(d => +d.vues || 0), 'Vues', acc.color));
  if (engCtx) {
    const engData = days.map(d => (+d.likes||0) + (+d.commentaires||0) + (+d.partages||0) + (+d.sauvegardes||0));
    chartInstances.eng = new Chart(engCtx, chartConfig(engData, 'Engagement total', '#7c6cfc'));
  }
}

// ══════════════════════════════════════════════════════════
//  MODULE IDÉES
// ══════════════════════════════════════════════════════════
function renderIdees() {
  const acc = ACCOUNTS[currentAccount];
  const ideas = getData(`ideas_${currentAccount}`, []);

  return `
<div class="section-title">💡 Générateur d'idées <span class="badge">${acc.name} ${acc.sub}</span></div>

<div class="card" style="margin-bottom:24px">
  <div class="card-title">Nouvelle idée</div>
  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Objectif</label>
      <select class="form-select" id="ideaObjectif">
        <option>Branding</option>
        <option>Visibilité</option>
        <option>Engagement</option>
        <option>Conversion</option>
        <option>Autorité</option>
        <option>Recrutement club</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Format</label>
      <select class="form-select" id="ideaFormat">
        <option>Libre</option>
        <option>Carrousel</option>
        <option>Texte/Post</option>
        <option>Vidéo courte</option>
        <option>Story</option>
        <option>Thread</option>
      </select>
    </div>
  </div>
  <div class="form-group">
    <label class="form-label">Thème ou sujet</label>
    <input class="form-input" id="ideaTheme" placeholder="Ex : le moment où j'ai décidé de créer Wema, doute face à une décision difficile..." />
  </div>
  <div class="form-group">
    <label class="form-label">Contexte ou précision (optionnel)</label>
    <textarea class="form-textarea" id="ideaContexte" placeholder="Ce que tu veux inclure, éviter, ou l'angle particulier..." style="min-height:70px"></textarea>
  </div>
  <div class="btn-group">
    <button class="btn btn-primary" id="generateIdeaBtn">Générer le prompt Claude</button>
    <button class="btn btn-ghost" id="saveIdeaBtn">Sauvegarder l'idée</button>
  </div>
</div>

<div id="ideaPromptBox" style="display:none">
  <div class="prompt-box-header">
    <span style="font-size:13px;font-weight:600;color:var(--text-muted)">PROMPT À COLLER DANS CLAUDE</span>
    <button class="copy-btn" id="copyIdeaPrompt">Copier</button>
  </div>
  <div class="prompt-box" id="ideaPromptContent"></div>
</div>

<div class="section-title" style="margin-top:24px">Idées sauvegardées</div>
${ideas.length === 0
  ? `<div class="empty-state"><div class="empty-icon">💡</div><div class="empty-text">Aucune idée sauvegardée.<br>Génère et sauvegarde tes idées ici.</div></div>`
  : ideas.slice().reverse().map((idea, i) => `
<div class="content-card">
  <div class="content-card-top">
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <span class="tag tag-objectif">${idea.objectif}</span>
      <span class="tag tag-format">${idea.format}</span>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <span class="content-card-date">${new Date(idea.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</span>
      <button class="btn btn-ghost" style="padding:3px 10px;font-size:11px" onclick="deleteIdea(${ideas.length-1-i})">✕</button>
    </div>
  </div>
  <div class="content-card-text"><strong>${idea.theme}</strong>${idea.contexte ? ' — ' + idea.contexte : ''}</div>
</div>`).join('')}
`;
}

function generateIdeaPrompt() {
  const acc = ACCOUNTS[currentAccount];
  const persona = getData(`persona_${currentAccount}`, PERSONAS_DEFAULT[currentAccount] || {});
  const objectif = document.getElementById('ideaObjectif')?.value;
  const format = document.getElementById('ideaFormat')?.value;
  const theme = document.getElementById('ideaTheme')?.value;
  const contexte = document.getElementById('ideaContexte')?.value;

  const prompt = `Tu es mon assistant éditorial pour mon compte ${acc.name} ${acc.sub}.

PROFIL DU COMPTE :
- Plateforme : ${acc.platform}
- Persona : ${acc.type === 'perso' ? 'Chaybia, fondatrice UM Mentor & Wema Club' : 'Wema Club, communauté'}
- Style d'écriture : ${persona.style || '—'}
- Ton : ${persona.ton || '—'}
- Posture : ${persona.posture || '—'}
- Règle éditoriale : ${persona.regle || '—'}

DEMANDE :
- Objectif : ${objectif}
- Format : ${format}
- Thème/Sujet : ${theme}
${contexte ? `- Précision : ${contexte}` : ''}

INSTRUCTIONS :
1. Propose 3 angles différents pour ce sujet sur cette plateforme
2. Pour chaque angle : 1 phrase décrivant l'idée + 1 hook (accroche d'ouverture)
3. Indique le niveau d'émotion et l'intensité de chaque angle (de 1 à 10)
4. Recommande lequel est le plus adapté au compte et explique pourquoi

Reste dans l'univers de la fondatrice / ${acc.type === 'club' ? 'du club' : 'du personal branding'}, pas de généralités.`;

  return prompt;
}

window.deleteIdea = function(index) {
  const ideas = getData(`ideas_${currentAccount}`, []);
  ideas.splice(index, 1);
  setData(`ideas_${currentAccount}`, ideas);
  renderModule();
};

// ══════════════════════════════════════════════════════════
//  MODULE RÉDACTION
// ══════════════════════════════════════════════════════════
function renderRedaction() {
  const acc = ACCOUNTS[currentAccount];

  return `
<div class="section-title">✍️ Rédaction <span class="badge">${acc.name} ${acc.sub}</span></div>

<div class="card" style="margin-bottom:24px">
  <div class="card-title">Paramètres du contenu</div>
  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Intention</label>
      <select class="form-select" id="redIntention">
        <option>Branding / Qui je suis</option>
        <option>Partage d'expérience</option>
        <option>Opinion / Prise de position</option>
        <option>Déclic / Enseignement</option>
        <option>Coulisses / Derrière la scène</option>
        <option>Annonce / Invitation</option>
        <option>Témoignage membre</option>
        <option>Contenu miroir (universel)</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Format</label>
      <select class="form-select" id="redFormat">
        <option>Post texte</option>
        <option>Carrousel (script)</option>
        <option>Script vidéo</option>
        <option>Caption courte</option>
        <option>Story (suite)</option>
        <option>Thread</option>
      </select>
    </div>
  </div>

  <div class="form-group">
    <label class="form-label">Sujet / Idée de base</label>
    <textarea class="form-textarea" id="redSujet" placeholder="Décris ton idée, l'histoire, le moment, la décision... Autant de détails que possible."></textarea>
  </div>

  <div class="form-group">
    <label class="form-label">Éléments à inclure (optionnel)</label>
    <input class="form-input" id="redInclure" placeholder="Ex: la date de création, une citation, un chiffre précis, une anecdote..." />
  </div>

  <div class="form-group">
    <label class="form-label">Éléments à éviter</label>
    <input class="form-input" id="redEviter" placeholder="Ex: trop d'émotion, la mention directe du club, les listes à puces..." />
  </div>

  <div style="margin-bottom:20px">
    <div class="card-title">Calibrage du ton</div>
    <div class="slider-group">
      <div class="slider-row">
        <span class="slider-label">Niveau émotion</span>
        <input type="range" class="slider" id="sliderEmotion" min="1" max="10" value="6" oninput="document.getElementById('valEmotion').textContent=this.value">
        <span class="slider-val" id="valEmotion">6</span>
      </div>
      <div class="slider-row" style="margin-top:10px">
        <span class="slider-label">Niveau storytelling</span>
        <input type="range" class="slider" id="sliderStory" min="1" max="10" value="7" oninput="document.getElementById('valStory').textContent=this.value">
        <span class="slider-val" id="valStory">7</span>
      </div>
      <div class="slider-row" style="margin-top:10px">
        <span class="slider-label">Niveau directivité</span>
        <input type="range" class="slider" id="sliderDir" min="1" max="10" value="5" oninput="document.getElementById('valDir').textContent=this.value">
        <span class="slider-val" id="valDir">5</span>
      </div>
    </div>
  </div>

  <button class="btn btn-primary" id="generateRedBtn">Générer le prompt Claude</button>
</div>

<div id="redPromptBox" style="display:none">
  <div class="prompt-box-header">
    <span style="font-size:13px;font-weight:600;color:var(--text-muted)">PROMPT À COLLER DANS CLAUDE</span>
    <button class="copy-btn" id="copyRedPrompt">Copier</button>
  </div>
  <div class="prompt-box" id="redPromptContent"></div>
</div>
`;
}

function generateRedactionPrompt() {
  const acc = ACCOUNTS[currentAccount];
  const persona = getData(`persona_${currentAccount}`, PERSONAS_DEFAULT[currentAccount] || {});
  const intention = document.getElementById('redIntention')?.value;
  const format = document.getElementById('redFormat')?.value;
  const sujet = document.getElementById('redSujet')?.value;
  const inclure = document.getElementById('redInclure')?.value;
  const eviter = document.getElementById('redEviter')?.value;
  const emotion = document.getElementById('sliderEmotion')?.value || 6;
  const story = document.getElementById('sliderStory')?.value || 7;
  const dir = document.getElementById('sliderDir')?.value || 5;

  const prompt = `Tu vas rédiger un contenu pour mon compte ${acc.name} ${acc.sub}.

IDENTITÉ ÉDITORIALE DU COMPTE :
- Plateforme : ${acc.name} (${acc.type === 'perso' ? 'compte personnel' : 'compte club'})
- Persona : ${acc.type === 'perso' ? 'Chaybia Maftaha, fondatrice UM Mentor & Wema Club. Je bâtis des communautés où les bonnes personnes se rencontrent pour grandir, collaborer et avancer.' : 'Wema Club — voix de la communauté, autorité douce, guide'}
- Style : ${persona.style || '—'}
- Ton : ${persona.ton || '—'}
- Posture : ${persona.posture || '—'}
- Règle éditoriale : ${persona.regle || '—'}
- Type de hook : ${persona.hook_type || '—'}
- CTA habituel : ${persona.cta || '—'}

CALIBRAGE :
- Niveau émotion : ${emotion}/10
- Niveau storytelling : ${story}/10
- Niveau directivité : ${dir}/10

CONTENU À RÉDIGER :
- Intention : ${intention}
- Format : ${format}
- Sujet / Idée : ${sujet}
${inclure ? `- Inclure : ${inclure}` : ''}
${eviter ? `- Éviter : ${eviter}` : ''}

CONSIGNES DE RÉDACTION :
- Écris comme Chaybia parle, pas comme une IA
- Pas de hashtags dans le corps du texte
- Pas de phrases génériques type "Dans un monde où..."
- Pas de listes à puces sauf si le format l'exige vraiment
- ${acc.platform === 'linkedin' ? 'Phrases courtes, allers à la ligne fréquents, structure lisible' : ''}
- ${acc.platform === 'tiktok' ? 'Style oral, rythme, spontané — comme si tu parlais à la caméra' : ''}
- ${acc.platform === 'instagram' ? 'Caption incarnée, proche, visuellement aérée' : ''}

Propose une version principale + 1 variante avec un angle légèrement différent.`;

  return prompt;
}

// ══════════════════════════════════════════════════════════
//  MODULE SIMULATION
// ══════════════════════════════════════════════════════════
function renderSimulation() {
  const acc = ACCOUNTS[currentAccount];

  return `
<div class="section-title">🚨 Simulation de performance <span class="badge">${acc.name} ${acc.sub}</span></div>

<div class="card" style="margin-bottom:24px">
  <div class="card-title">Contenu à évaluer</div>
  <div class="form-group">
    <label class="form-label">Colle ton contenu ici</label>
    <textarea class="form-textarea" id="simContent" placeholder="Colle ton post, script ou caption complet..." style="min-height:150px"></textarea>
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
  <button class="btn btn-primary" id="generateSimBtn">Générer l'analyse Claude</button>
</div>

<div id="simPromptBox" style="display:none">
  <div class="prompt-box-header">
    <span style="font-size:13px;font-weight:600;color:var(--text-muted)">PROMPT D'ANALYSE À COLLER DANS CLAUDE</span>
    <button class="copy-btn" id="copySimPrompt">Copier</button>
  </div>
  <div class="prompt-box" id="simPromptContent"></div>
</div>

<div class="card" style="margin-top:24px">
  <div class="card-title">📋 Guide d'évaluation rapide — ${acc.name} ${acc.sub}</div>
  ${renderEvalGuide()}
</div>
`;
}

function renderEvalGuide() {
  const persona = PERSONAS_DEFAULT[currentAccount] || {};
  const checklist = [
    ['Hook fort en ouverture ?', `Type attendu : ${persona.hook_type || 'Accroche forte'}`],
    ['Ton cohérent avec le compte ?', `Ton cible : ${persona.ton || '—'}`],
    ['Règle éditoriale respectée ?', persona.regle || '—'],
    ['CTA présent et adapté ?', persona.cta || '—'],
    ['Pas de contenu réservé à l\'autre compte ?', acc => acc?.type === 'perso' ? 'Ne pas parler des events/préparations (→ compte club)' : 'Ne pas parler du perso de Chaybia (→ compte perso)'],
  ];

  return `<div style="display:flex;flex-direction:column;gap:10px">
    ${checklist.map(([q, hint]) => `
    <div style="display:flex;gap:12px;align-items:flex-start">
      <input type="checkbox" style="margin-top:3px;accent-color:var(--accent)">
      <div>
        <div style="font-size:13px;font-weight:500">${q}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${typeof hint === 'function' ? hint(ACCOUNTS[currentAccount]) : hint}</div>
      </div>
    </div>`).join('')}
  </div>`;
}

function generateSimulationPrompt() {
  const acc = ACCOUNTS[currentAccount];
  const persona = getData(`persona_${currentAccount}`, PERSONAS_DEFAULT[currentAccount] || {});
  const content = document.getElementById('simContent')?.value;
  const format = document.getElementById('simFormat')?.value;
  const intention = document.getElementById('simIntention')?.value;

  return `Tu es mon directeur éditorial. Analyse ce contenu avant publication.

COMPTE : ${acc.name} ${acc.sub}
Format : ${format}
Intention : ${intention}

IDENTITÉ ÉDITORIALE :
- Persona : ${persona.posture || '—'}
- Style : ${persona.style || '—'}
- Ton : ${persona.ton || '—'}
- Hook attendu : ${persona.hook_type || '—'}
- Règle : ${persona.regle || '—'}

CONTENU À ANALYSER :
---
${content}
---

ANALYSE EN 4 PARTIES :
1. SCORE DE PERFORMANCE ESTIMÉ (sur 10) avec justification en 2 lignes
2. FORCES — ce qui fonctionne bien (max 3 points)
3. FAIBLESSES — ce qui peut freiner la performance (max 3 points)
4. AMÉLIORATIONS — 2 suggestions concrètes pour booster ce contenu

Sois direct, précis, actionnable. Pas de compliments vides.`;
}

// ══════════════════════════════════════════════════════════
//  MODULE PERSONA
// ══════════════════════════════════════════════════════════
function renderPersona() {
  const acc = ACCOUNTS[currentAccount];
  const persona = getData(`persona_${currentAccount}`, PERSONAS_DEFAULT[currentAccount] || {});
  const fields = [
    { key: 'style', label: 'Style d\'écriture' },
    { key: 'ton', label: 'Ton' },
    { key: 'posture', label: 'Posture' },
    { key: 'sujets', label: 'Sujets récurrents' },
    { key: 'emotion', label: 'Niveau émotionnel' },
    { key: 'regle', label: 'Règle éditoriale 80/20' },
    { key: 'hook_type', label: 'Type de hook' },
    { key: 'cta', label: 'CTA habituel' },
  ];

  return `
<div class="section-title">🧠 Persona <span class="badge">${acc.name} ${acc.sub}</span></div>

<div class="card" style="margin-bottom:24px;border-left:3px solid ${acc.color}">
  <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px">Ces données alimentent automatiquement tous les autres modules (rédaction, idées, simulation).</div>
  <div class="persona-grid">
    ${fields.map(f => `
    <div class="persona-item">
      <div class="persona-item-label">${f.label}</div>
      <textarea class="form-textarea persona-field" data-key="${f.key}" style="min-height:60px;font-size:13px">${persona[f.key] || ''}</textarea>
    </div>`).join('')}
  </div>
  <div class="btn-group">
    <button class="btn btn-primary" id="savePersonaBtn">Sauvegarder</button>
    <button class="btn btn-ghost" id="resetPersonaBtn">Réinitialiser par défaut</button>
  </div>
</div>

<div class="card">
  <div class="card-title">Aperçu — Identité éditoriale</div>
  <div style="font-size:14px;line-height:1.8;color:var(--text)">
    <strong>${acc.name} ${acc.sub}</strong> est un compte de <em>${acc.type === 'perso' ? 'personal branding' : 'communauté'}</em>.<br>
    Style : ${persona.style || '—'}<br>
    Ton : ${persona.ton || '—'}<br>
    Règle : ${persona.regle || '—'}
  </div>
</div>
`;
}

// ══════════════════════════════════════════════════════════
//  MODULE CALENDRIER
// ══════════════════════════════════════════════════════════
function renderCalendrier() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const allPosts = {};

  Object.keys(ACCOUNTS).forEach(acc => {
    const posts = getData(postsKey(acc), []);
    posts.forEach(p => {
      if (!allPosts[p.date]) allPosts[p.date] = [];
      allPosts[p.date].push({ ...p, account: acc });
    });
  });

  const calEvents = getData('cal_events', []);

  let calHtml = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = dateStr === today.toISOString().split('T')[0];
    const posts = allPosts[dateStr] || [];
    const events = calEvents.filter(e => e.date === dateStr);

    calHtml += `
<div class="cal-day ${isToday ? 'today' : ''}">
  <div class="cal-day-num">${d.getDate()}</div>
  ${posts.map(p => {
    const acc = ACCOUNTS[p.account];
    return `<div class="cal-post-pill" style="background:${acc?.color}22;color:${acc?.color}">${acc?.icon} ${p.format}</div>`;
  }).join('')}
  ${events.map(e => `<div class="cal-post-pill" style="background:var(--accent-glow);color:var(--accent)">${e.text}</div>`).join('')}
</div>`;
  }

  return `
<div class="section-title">📅 Calendrier — Semaine du ${startOfWeek.toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}</div>

<div class="card" style="margin-bottom:24px">
  <div class="cal-grid">
    ${days.map(d => `<div class="cal-day-header">${d}</div>`).join('')}
    ${calHtml}
  </div>
</div>

<div class="card" style="margin-bottom:24px">
  <div class="card-title">Ajouter un événement</div>
  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Date</label>
      <input class="form-input" type="date" id="calDate" value="${today.toISOString().split('T')[0]}" />
    </div>
    <div class="form-group">
      <label class="form-label">Contenu / Note</label>
      <input class="form-input" id="calText" placeholder="Ex: Post LinkedIn fondatrice, Reel Wema..." />
    </div>
  </div>
  <button class="btn btn-primary" id="addCalEventBtn">Ajouter</button>
</div>

<div class="card">
  <div class="card-title">Vue d'ensemble — Tous comptes</div>
  ${Object.keys(ACCOUNTS).map(acc => {
    const posts = getData(postsKey(acc), []);
    const thisWeek = posts.filter(p => {
      const d = new Date(p.date);
      return d >= startOfWeek && d <= today;
    });
    const a = ACCOUNTS[acc];
    return `
<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
  <span style="width:28px;height:28px;border-radius:6px;background:${a.color}22;color:${a.color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${a.icon}</span>
  <span style="flex:1;font-size:13px">${a.name} ${a.sub}</span>
  <span style="font-size:12px;color:var(--text-muted)">${thisWeek.length} post${thisWeek.length > 1 ? 's' : ''} cette semaine</span>
</div>`;
  }).join('')}
</div>
`;
}

// ══════════════════════════════════════════════════════════
//  MODULE RECYCLAGE
// ══════════════════════════════════════════════════════════
function renderRecyclage() {
  const acc = ACCOUNTS[currentAccount];

  return `
<div class="section-title">🔁 Recyclage intelligent <span class="badge">${acc.name} ${acc.sub}</span></div>

<div class="card" style="margin-bottom:24px">
  <div class="card-title">Adapter un contenu existant</div>
  <div class="form-group">
    <label class="form-label">Contenu source</label>
    <textarea class="form-textarea" id="recycContent" placeholder="Colle le contenu original que tu veux recycler..." style="min-height:120px"></textarea>
  </div>
  <div class="form-group">
    <label class="form-label">Plateforme source (d'où vient ce contenu ?)</label>
    <select class="form-select" id="recycSource">
      <option>LinkedIn Perso</option>
      <option>Instagram Perso</option>
      <option>TikTok Perso</option>
      <option>Instagram Wema</option>
      <option>TikTok Wema</option>
      <option>Autre</option>
    </select>
  </div>
  <div class="form-group">
    <label class="form-label">Adapter pour</label>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
      ${Object.entries(ACCOUNTS).map(([key, a]) => `
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border);border-radius:6px;font-size:12px">
        <input type="checkbox" class="recycle-target" value="${key}" style="accent-color:${a.color}" ${key === currentAccount ? 'checked' : ''}>
        <span style="color:${a.color}">${a.icon}</span> ${a.name} ${a.sub}
      </label>`).join('')}
    </div>
  </div>
  <div class="form-group">
    <label class="form-label">Instruction spécifique (optionnel)</label>
    <input class="form-input" id="recycInstruction" placeholder="Ex: simplifier, rendre plus émotionnel, adapter pour l'oral..." />
  </div>
  <button class="btn btn-primary" id="generateRecycBtn">Générer le prompt Claude</button>
</div>

<div id="recycPromptBox" style="display:none">
  <div class="prompt-box-header">
    <span style="font-size:13px;font-weight:600;color:var(--text-muted)">PROMPT À COLLER DANS CLAUDE</span>
    <button class="copy-btn" id="copyRecycPrompt">Copier</button>
  </div>
  <div class="prompt-box" id="recycPromptContent"></div>
</div>
`;
}

function generateRecyclagePrompt() {
  const content = document.getElementById('recycContent')?.value;
  const source = document.getElementById('recycSource')?.value;
  const instruction = document.getElementById('recycInstruction')?.value;
  const targets = [...document.querySelectorAll('.recycle-target:checked')].map(cb => {
    const acc = ACCOUNTS[cb.value];
    const persona = getData(`persona_${cb.value}`, PERSONAS_DEFAULT[cb.value] || {});
    return `\n### ${acc.name} ${acc.sub}\n- Style : ${persona.style || '—'}\n- Ton : ${persona.ton || '—'}\n- Format adapté : ${acc.platform === 'tiktok' ? 'Script oral' : acc.platform === 'instagram' ? 'Caption visuelle' : 'Post texte'}\n- Règle : ${persona.regle || '—'}`;
  }).join('');

  return `Tu es mon assistant de recyclage de contenu.

CONTENU ORIGINAL (provenant de : ${source}) :
---
${content}
---
${instruction ? `\nINSTRUCTION SPÉCIFIQUE : ${instruction}` : ''}

ADAPTE CE CONTENU POUR CES COMPTES :
${targets}

CONSIGNES :
- Pour chaque compte, produis une version complète et prête à publier
- Respecte scrupuleusement le ton, le style et la posture de chaque compte
- Ne copie pas, réinterprète le fond selon l'identité du compte
- Un compte TikTok = style oral, rythme, direct caméra
- Un compte Instagram = incarné, visuellement aéré
- Un compte LinkedIn = structuré, réflexif, paragraphes courts
- Garde l'essence et le message clé de l'original`;
}

// ══════════════════════════════════════════════════════════
//  MODULE MIROIR
// ══════════════════════════════════════════════════════════
function renderMiroir() {
  const allData = Object.keys(ACCOUNTS).map(acc => {
    const posts = getData(postsKey(acc), []);
    const lastWeek = posts.filter(p => {
      const d = new Date(p.date);
      const now = new Date();
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      return d >= weekAgo;
    });
    return { acc, name: ACCOUNTS[acc].name + ' ' + ACCOUNTS[acc].sub, posts: lastWeek, total: posts };
  });

  const totalPostsWeek = allData.reduce((s, d) => s + d.posts.length, 0);

  return `
<div class="section-title">🪞 Miroir stratégique — Semaine du ${new Date(Date.now()-7*86400000).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}</div>

<div class="grid-3" style="margin-bottom:24px">
  <div class="stat-card">
    <div class="stat-label">Posts cette semaine</div>
    <div class="stat-value">${totalPostsWeek}</div>
    <div class="stat-delta neutral">tous comptes confondus</div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Comptes actifs</div>
    <div class="stat-value">${allData.filter(d => d.posts.length > 0).length} / 5</div>
    <div class="stat-delta ${allData.filter(d=>d.posts.length>0).length >= 3 ? 'up' : 'down'}">
      ${allData.filter(d => d.posts.length > 0).length >= 3 ? '↑ Bonne couverture' : '↓ Couvrir plus de comptes'}
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Contenu total enregistré</div>
    <div class="stat-value">${allData.reduce((s,d) => s+d.total.length, 0)}</div>
    <div class="stat-delta neutral">depuis le début</div>
  </div>
</div>

<div class="grid-2">
  ${allData.map(d => `
  <div class="card">
    <div class="card-title" style="color:${ACCOUNTS[d.acc].color}">${d.name}</div>
    <div style="font-size:28px;font-weight:800;margin-bottom:4px">${d.posts.length} <span style="font-size:14px;font-weight:400;color:var(--text-muted)">posts / semaine</span></div>
    ${d.posts.length === 0
      ? `<div style="font-size:12px;color:var(--text-faint);margin-top:8px">Aucun post enregistré cette semaine</div>`
      : `<div style="font-size:12px;color:var(--text-muted);margin-top:8px">Formats : ${[...new Set(d.posts.map(p=>p.format))].join(', ')}</div>`
    }
  </div>`).join('')}
</div>

<div class="card" style="margin-top:24px">
  <div class="card-title">Générer le bilan stratégique hebdo avec Claude</div>
  <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">
    Copie ce prompt dans Claude pour obtenir une analyse de cohérence de ta semaine.
  </div>
  <div class="prompt-box-header">
    <span style="font-size:13px;font-weight:600;color:var(--text-muted)">PROMPT MIROIR HEBDO</span>
    <button class="copy-btn" id="copyMiroirPrompt">Copier</button>
  </div>
  <div class="prompt-box" id="miroirPromptContent">${generateMiroirPrompt(allData)}</div>
</div>
`;
}

function generateMiroirPrompt(allData) {
  const summary = allData.map(d =>
    `${d.name} : ${d.posts.length} post(s) — ${d.posts.map(p=>`"${p.text?.substring(0,40)||p.format}"`).join(', ') || 'aucun'}`
  ).join('\n');

  return `Tu es mon directeur de contenu. Voici ma semaine en chiffres :

${summary}

Mon positionnement global : Fondatrice de UM Mentor & Wema Club. Je bâtis des communautés où les bonnes personnes se rencontrent pour grandir, collaborer et avancer.

Mes 5 comptes : LinkedIn perso (branding fondatrice), Instagram perso (branding fondatrice), TikTok perso (branding fondatrice), Instagram Wema (visibilité club), TikTok Wema (visibilité club).

ANALYSE EN 4 PARTIES :
1. Ce qui a changé dans mon contenu cette semaine
2. Ce qui marche le mieux et pourquoi
3. Cohérence globale de mes messages entre comptes
4. Ce que mon contenu raconte de moi "sans que je m'en rende compte"

Puis donne-moi :
- 1 insight clé à retenir
- 1 déséquilibre à corriger
- 1 type de contenu manquant cette semaine`;
}

// ══════════════════════════════════════════════════════════
//  BIND EVENTS
// ══════════════════════════════════════════════════════════
function bindModuleEvents() {
  const today = new Date().toISOString().split('T')[0];

  switch (currentModule) {

    case 'analyse':
      initAnalyseCharts();

      document.getElementById('saveStatsBtn')?.addEventListener('click', () => {
        const stats = {};
        document.querySelectorAll('.stat-field').forEach(el => { stats[el.dataset.field] = el.value; });
        setData(statsKey(currentAccount, today), stats);
        showToast('Stats enregistrées ✓');
        destroyCharts();
        initAnalyseCharts();
      });

      document.getElementById('addPostBtn')?.addEventListener('click', () => {
        const form = document.getElementById('addPostForm');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
      });

      document.getElementById('cancelPostBtn')?.addEventListener('click', () => {
        document.getElementById('addPostForm').style.display = 'none';
      });

      document.getElementById('savePostBtn')?.addEventListener('click', () => {
        const posts = getData(postsKey(currentAccount), []);
        posts.push({
          text: document.getElementById('postText')?.value,
          format: document.getElementById('postFormat')?.value,
          date: document.getElementById('postDate')?.value || today,
          vues: document.getElementById('post_vues')?.value,
          likes: document.getElementById('post_likes')?.value,
          commentaires: document.getElementById('post_commentaires')?.value,
          sujet: document.getElementById('postSujet')?.value,
        });
        setData(postsKey(currentAccount), posts);
        showToast('Post enregistré ✓');
        renderModule();
      });
      break;

    case 'idees':
      document.getElementById('generateIdeaBtn')?.addEventListener('click', () => {
        const prompt = generateIdeaPrompt();
        const box = document.getElementById('ideaPromptBox');
        const content = document.getElementById('ideaPromptContent');
        box.style.display = 'block';
        content.textContent = prompt;
        box.scrollIntoView({ behavior: 'smooth' });
      });

      document.getElementById('saveIdeaBtn')?.addEventListener('click', () => {
        const ideas = getData(`ideas_${currentAccount}`, []);
        ideas.push({
          objectif: document.getElementById('ideaObjectif')?.value,
          format: document.getElementById('ideaFormat')?.value,
          theme: document.getElementById('ideaTheme')?.value,
          contexte: document.getElementById('ideaContexte')?.value,
          date: today,
        });
        setData(`ideas_${currentAccount}`, ideas);
        showToast('Idée sauvegardée ✓');
        renderModule();
      });

      document.getElementById('copyIdeaPrompt')?.addEventListener('click', () => {
        copyText(document.getElementById('ideaPromptContent')?.textContent, 'copyIdeaPrompt');
      });
      break;

    case 'redaction':
      document.getElementById('generateRedBtn')?.addEventListener('click', () => {
        const prompt = generateRedactionPrompt();
        const box = document.getElementById('redPromptBox');
        const content = document.getElementById('redPromptContent');
        box.style.display = 'block';
        content.textContent = prompt;
        box.scrollIntoView({ behavior: 'smooth' });
      });

      document.getElementById('copyRedPrompt')?.addEventListener('click', () => {
        copyText(document.getElementById('redPromptContent')?.textContent, 'copyRedPrompt');
      });
      break;

    case 'simulation':
      document.getElementById('generateSimBtn')?.addEventListener('click', () => {
        const prompt = generateSimulationPrompt();
        const box = document.getElementById('simPromptBox');
        const content = document.getElementById('simPromptContent');
        box.style.display = 'block';
        content.textContent = prompt;
        box.scrollIntoView({ behavior: 'smooth' });
      });

      document.getElementById('copySimPrompt')?.addEventListener('click', () => {
        copyText(document.getElementById('simPromptContent')?.textContent, 'copySimPrompt');
      });
      break;

    case 'persona':
      document.getElementById('savePersonaBtn')?.addEventListener('click', () => {
        const persona = {};
        document.querySelectorAll('.persona-field').forEach(el => { persona[el.dataset.key] = el.value; });
        setData(`persona_${currentAccount}`, persona);
        showToast('Persona sauvegardé ✓');
      });

      document.getElementById('resetPersonaBtn')?.addEventListener('click', () => {
        setData(`persona_${currentAccount}`, PERSONAS_DEFAULT[currentAccount] || {});
        showToast('Persona réinitialisé');
        renderModule();
      });
      break;

    case 'calendrier':
      document.getElementById('addCalEventBtn')?.addEventListener('click', () => {
        const events = getData('cal_events', []);
        const text = document.getElementById('calText')?.value;
        const date = document.getElementById('calDate')?.value;
        if (text && date) {
          events.push({ text, date });
          setData('cal_events', events);
          showToast('Événement ajouté ✓');
          renderModule();
        }
      });
      break;

    case 'recyclage':
      document.getElementById('generateRecycBtn')?.addEventListener('click', () => {
        const prompt = generateRecyclagePrompt();
        const box = document.getElementById('recycPromptBox');
        const content = document.getElementById('recycPromptContent');
        box.style.display = 'block';
        content.textContent = prompt;
        box.scrollIntoView({ behavior: 'smooth' });
      });

      document.getElementById('copyRecycPrompt')?.addEventListener('click', () => {
        copyText(document.getElementById('recycPromptContent')?.textContent, 'copyRecycPrompt');
      });
      break;

    case 'miroir':
      document.getElementById('copyMiroirPrompt')?.addEventListener('click', () => {
        copyText(document.getElementById('miroirPromptContent')?.textContent, 'copyMiroirPrompt');
      });
      break;
  }
}

// ── UTILS ────────────────────────────────────────────────
function copyText(text, btnId) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.textContent = '✓ Copié !';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copier';
        btn.classList.remove('copied');
      }, 2000);
    }
    showToast('Copié dans le presse-papier ✓', 'success');
  });
}

function showToast(msg, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// Init topbar on load
updateTopbar();
