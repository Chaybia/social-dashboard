// ══════════════════════════════════════════════════════════
//  MODULE CONNEXION & IMPORT
//  Instagram OAuth · TikTok ZIP/JSON · LinkedIn CSV
// ══════════════════════════════════════════════════════════

// ── RENDER ───────────────────────────────────────────────
window.renderConnexion = function() {
  const s = get('settings', {});
  const instaPerso  = get('instagram_token_insta-perso',  {});
  const instaWema   = get('instagram_token_insta-wema',   {});

  return `
<div class="section-title">🔗 Connexions & Import de données</div>

<!-- ───── INSTAGRAM ───── -->
<div class="conn-section">
  <div class="conn-section-title">
    <span class="conn-icon" style="background:rgba(225,48,108,0.15);color:#e1306c">◉</span>
    Instagram
    <span class="conn-note">Connexion directe via Meta API — stats automatiques</span>
  </div>

  <div class="grid-2">
    ${renderInstaCard('insta-perso', 'Compte Perso', instaPerso)}
    ${renderInstaCard('insta-wema',  'Wema Club',    instaWema)}
  </div>

  <div class="conn-help">
    <strong>Première fois ?</strong> Tu as besoin d'un App ID Meta gratuit.
    <button class="btn-link" id="showInstaSetup">Voir le guide de setup →</button>
  </div>

  <div class="setup-guide" id="instaSetupGuide" style="display:none">
    <div class="setup-step"><span class="step-num">1</span> Va sur <strong>developers.facebook.com</strong> → "Mes applications" → "Créer une application"</div>
    <div class="setup-step"><span class="step-num">2</span> Choisis <strong>"Consumer"</strong> comme type</div>
    <div class="setup-step"><span class="step-num">3</span> Dans "Produits", ajoute <strong>Instagram Graph API</strong></div>
    <div class="setup-step"><span class="step-num">4</span> Dans Paramètres → Basic → copie l'<strong>App ID</strong> et l'<strong>App Secret</strong></div>
    <div class="setup-step"><span class="step-num">5</span> Ajoute l'URI de redirection : <strong id="redirectUriDisplay">${window.location.origin}/</strong></div>
    <div class="setup-step"><span class="step-num">6</span> Dans Vercel → Settings → Environment Variables → ajoute <code>INSTAGRAM_APP_ID</code> et <code>INSTAGRAM_APP_SECRET</code></div>
    <div class="form-row" style="margin-top:16px">
      <div class="form-group">
        <label class="form-label">App ID Meta (pour l'OAuth)</label>
        <input class="form-input" id="metaAppId" placeholder="123456789..." value="${s.metaAppId||''}" />
      </div>
    </div>
    <button class="btn btn-ghost" id="saveMetaAppId" style="margin-top:8px">Sauvegarder l'App ID</button>
  </div>
</div>

<!-- ───── TIKTOK ───── -->
<div class="conn-section">
  <div class="conn-section-title">
    <span class="conn-icon" style="background:rgba(255,0,80,0.15);color:#ff0050">♪</span>
    TikTok
    <span class="conn-note">Import du fichier export TikTok Analytics</span>
  </div>

  <div class="grid-2">
    ${renderImportCard('tiktok-perso', 'Compte Perso',  'tiktok')}
    ${renderImportCard('tiktok-wema',  'Wema Club',     'tiktok')}
  </div>

  <div class="conn-help">
    <strong>Comment exporter depuis TikTok ?</strong>
    <button class="btn-link" id="showTikTokHelp">Voir le guide →</button>
  </div>
  <div class="setup-guide" id="tiktokHelpGuide" style="display:none">
    <div class="setup-step"><span class="step-num">1</span> Ouvre TikTok → <strong>Analytics</strong> (depuis ton profil créateur)</div>
    <div class="setup-step"><span class="step-num">2</span> Clique sur <strong>"Exporter les données"</strong> (icône ↓ en haut à droite)</div>
    <div class="setup-step"><span class="step-num">3</span> Sélectionne la période voulue → <strong>Télécharger</strong></div>
    <div class="setup-step"><span class="step-num">4</span> Tu obtiens un fichier <code>.xlsx</code> ou <code>.csv</code> → <strong>glisse-le ici</strong></div>
    <br>
    <em style="color:var(--text-faint)">Alternative : Settings → Privacy → Download your data → format JSON</em>
  </div>
</div>

<!-- ───── LINKEDIN ───── -->
<div class="conn-section">
  <div class="conn-section-title">
    <span class="conn-icon" style="background:rgba(0,119,181,0.15);color:#0077b5">in</span>
    LinkedIn
    <span class="conn-note">Import du fichier export LinkedIn Analytics</span>
  </div>

  ${renderImportCard('linkedin-perso', 'Compte Perso', 'linkedin')}

  <div class="conn-help">
    <strong>Comment exporter depuis LinkedIn ?</strong>
    <button class="btn-link" id="showLinkedInHelp">Voir le guide →</button>
  </div>
  <div class="setup-guide" id="linkedinHelpGuide" style="display:none">
    <div class="setup-step"><span class="step-num">1</span> Va sur ton profil LinkedIn</div>
    <div class="setup-step"><span class="step-num">2</span> Clique sur <strong>"Analytics"</strong> sous ton fil de posts</div>
    <div class="setup-step"><span class="step-num">3</span> En haut à droite → <strong>"Exporter"</strong> → CSV</div>
    <div class="setup-step"><span class="step-num">4</span> Ou : Menu → Paramètres → Confidentialité → Obtenir une copie des données → Posts</div>
    <div class="setup-step"><span class="step-num">5</span> <strong>Glisse le fichier CSV ici</strong></div>
  </div>
</div>

<!-- ───── STATUT GLOBAL ───── -->
<div class="card" style="margin-top:8px">
  <div class="card-title">Données importées — résumé</div>
  ${renderImportSummary()}
</div>`;
};

function renderInstaCard(accountKey, label, tokenData) {
  const connected = !!tokenData.access_token;
  const expiry = tokenData.expires_at ? new Date(tokenData.expires_at).toLocaleDateString('fr-FR') : null;
  const posts = get(postsKey(accountKey), []);

  return `
<div class="conn-card ${connected ? 'connected' : ''}">
  <div class="conn-card-top">
    <span class="conn-card-label">${label}</span>
    <span class="conn-status ${connected ? 'status-connected' : 'status-disconnected'}">
      ${connected ? '● Connecté' : '○ Non connecté'}
    </span>
  </div>
  ${connected
    ? `<div class="conn-card-info">
        <div>@${tokenData.username || '—'}</div>
        <div style="font-size:11px;color:var(--text-faint)">Token expire le ${expiry||'—'}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${posts.length} posts chargés</div>
       </div>
       <div class="btn-group" style="margin-top:12px">
         <button class="btn btn-primary btn-sm" onclick="syncInstagram('${accountKey}')">↻ Synchroniser</button>
         <button class="btn btn-ghost btn-sm" onclick="disconnectInstagram('${accountKey}')">Déconnecter</button>
       </div>`
    : `<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Connecte ton compte pour récupérer les stats automatiquement</div>
       <button class="btn btn-primary btn-sm" onclick="connectInstagram('${accountKey}')">Se connecter →</button>`
  }
</div>`;
}

function renderImportCard(accountKey, label, platform) {
  const lastImport = get(`last_import_${accountKey}`, null);
  const posts = get(postsKey(accountKey), []);

  return `
<div class="conn-card">
  <div class="conn-card-top">
    <span class="conn-card-label">${label}</span>
    ${lastImport ? `<span class="conn-status status-connected">● Importé</span>` : `<span class="conn-status status-disconnected">○ Aucune donnée</span>`}
  </div>
  ${lastImport
    ? `<div class="conn-card-info">
        <div style="font-size:12px;color:var(--text-muted)">Dernier import : ${new Date(lastImport).toLocaleDateString('fr-FR')}</div>
        <div style="font-size:12px;color:var(--text-muted)">${posts.length} posts chargés</div>
       </div>`
    : `<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Importe ton export ${platform === 'tiktok' ? 'TikTok Analytics (.xlsx ou .json)' : 'LinkedIn Analytics (.csv)'}</div>`
  }
  <div class="drop-zone" id="drop_${accountKey}" data-account="${accountKey}" data-platform="${platform}">
    <div class="drop-icon">📁</div>
    <div class="drop-text">Glisse ton fichier ici<br><span style="font-size:11px;color:var(--text-faint)">${platform === 'tiktok' ? '.xlsx · .csv · .json · .zip' : '.csv'}</span></div>
    <input type="file" class="drop-input" id="file_${accountKey}"
      accept="${platform === 'tiktok' ? '.xlsx,.csv,.json,.zip' : '.csv'}"
      data-account="${accountKey}" data-platform="${platform}" />
  </div>
</div>`;
}

function renderImportSummary() {
  const accounts = Object.keys(ACCOUNTS);
  return `<div style="display:flex;flex-direction:column;gap:8px">
    ${accounts.map(acc => {
      const a = ACCOUNTS[acc];
      const posts = get(postsKey(acc), []);
      const token = get(`instagram_token_${acc}`, {});
      const lastImport = get(`last_import_${acc}`, null);
      const connected = !!token.access_token || !!lastImport;
      return `<div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--surface2);border-radius:8px">
        <span style="width:28px;height:28px;border-radius:6px;background:${a.color}22;color:${a.color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${a.icon}</span>
        <span style="flex:1;font-size:13px">${a.name} ${a.sub}</span>
        <span style="font-size:12px;color:${connected?'#00c896':'var(--text-faint)'}">${connected ? `✓ ${posts.length} posts` : 'Aucune donnée'}</span>
      </div>`;
    }).join('')}
  </div>`;
}

// ── INSTAGRAM OAUTH ───────────────────────────────────────
window.connectInstagram = function(accountKey) {
  const s = get('settings', {});
  const appId = s.metaAppId;
  if (!appId) {
    alert('Entre ton App ID Meta d\'abord dans le guide de setup ci-dessus.');
    return;
  }
  const redirectUri = encodeURIComponent(window.location.origin + '/');
  const scope = 'instagram_basic,instagram_content_publish,pages_show_list,instagram_manage_insights';
  const state = accountKey;
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&response_type=code`;
  window.location.href = url;
};

window.disconnectInstagram = function(accountKey) {
  if (confirm('Déconnecter ce compte Instagram ?')) {
    localStorage.removeItem(`instagram_token_${accountKey}`);
    renderModule();
    showToast('Compte déconnecté');
  }
};

window.syncInstagram = async function(accountKey) {
  const tokenData = get(`instagram_token_${accountKey}`, {});
  if (!tokenData.access_token) return;
  showToast('Synchronisation...');
  try {
    await fetchInstagramPosts(accountKey, tokenData.access_token);
    showToast('Synchronisation réussie ✓');
    renderModule();
  } catch(e) {
    showToast('Erreur : ' + e.message);
  }
};

// Gestion du retour OAuth (code dans l'URL)
async function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state'); // accountKey
  if (!code || !state) return;

  // Nettoie l'URL
  window.history.replaceState({}, '', window.location.pathname);

  showToast('Échange du token en cours...');
  try {
    const redirectUri = encodeURIComponent(window.location.origin + '/');
    const res = await fetch(`/api/instagram-token?code=${code}&redirect_uri=${redirectUri}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Récupère le username
    const profileRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${data.access_token}`);
    const profile = await profileRes.json();

    // Sauvegarde
    set(`instagram_token_${state}`, {
      access_token: data.access_token,
      username: profile.username,
      user_id: profile.id,
      expires_at: Date.now() + (data.expires_in * 1000),
    });

    showToast(`@${profile.username} connecté ✓`);
    await fetchInstagramPosts(state, data.access_token);

    // Navigue vers Connexions
    document.querySelector('[data-module="connexion"]')?.click();
  } catch(e) {
    alert('Erreur OAuth : ' + e.message);
  }
}

async function fetchInstagramPosts(accountKey, token) {
  const tokenData = get(`instagram_token_${accountKey}`, {});
  const userId = tokenData.user_id;
  if (!userId) return;

  // Récupère les médias avec leurs insights
  const mediaRes = await fetch(
    `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,timestamp,like_count,comments_count&access_token=${token}&limit=50`
  );
  const mediaData = await mediaRes.json();
  if (mediaData.error) throw new Error(mediaData.error.message);

  const posts = get(postsKey(accountKey), []);
  const existingIds = new Set(posts.map(p => p.instagram_id).filter(Boolean));

  for (const media of (mediaData.data || [])) {
    if (existingIds.has(media.id)) continue;

    // Insights par post
    let vues = 0, reach = 0, saves = 0;
    try {
      const insightRes = await fetch(
        `https://graph.instagram.com/${media.id}/insights?metric=impressions,reach,saved&access_token=${token}`
      );
      const insightData = await insightRes.json();
      for (const metric of (insightData.data || [])) {
        if (metric.name === 'impressions') vues = metric.values?.[0]?.value || 0;
        if (metric.name === 'reach') reach = metric.values?.[0]?.value || 0;
        if (metric.name === 'saved') saves = metric.values?.[0]?.value || 0;
      }
    } catch {}

    posts.push({
      instagram_id: media.id,
      text: media.caption?.substring(0, 100) || '',
      format: mediaTypeToFormat(media.media_type),
      date: media.timestamp?.split('T')[0] || new Date().toISOString().split('T')[0],
      vues,
      reach,
      likes: media.like_count || 0,
      commentaires: media.comments_count || 0,
      sauvegardes: saves,
      partages: 0,
      source: 'instagram_api',
    });
  }

  set(postsKey(accountKey), posts);
}

function mediaTypeToFormat(type) {
  if (!type) return 'Post';
  if (type === 'IMAGE') return 'Image';
  if (type === 'VIDEO') return 'Vidéo';
  if (type === 'CAROUSEL_ALBUM') return 'Carrousel';
  return 'Post';
}

// ── FILE IMPORT ───────────────────────────────────────────
function initDropZones() {
  document.querySelectorAll('.drop-zone').forEach(zone => {
    const accountKey = zone.dataset.account;
    const platform   = zone.dataset.platform;
    const fileInput  = zone.querySelector('.drop-input');

    zone.addEventListener('click', () => fileInput.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) processFile(file, accountKey, platform);
    });
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) processFile(file, accountKey, platform);
    });
  });
}

async function processFile(file, accountKey, platform) {
  const zone = document.getElementById(`drop_${accountKey}`);
  if (zone) zone.innerHTML = `<div class="ai-loading"><div class="ai-spinner"></div><span>Lecture du fichier...</span></div>`;

  try {
    let posts = [];
    const name = file.name.toLowerCase();

    if (name.endsWith('.zip')) {
      posts = await parseTikTokZip(file);
    } else if (name.endsWith('.json')) {
      const text = await readFileText(file);
      const json = JSON.parse(text);
      posts = platform === 'tiktok' ? parseTikTokJSON(json) : [];
    } else if (name.endsWith('.csv')) {
      const text = await readFileText(file);
      posts = platform === 'tiktok' ? parseCSV(text, 'tiktok') : parseCSV(text, 'linkedin');
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      posts = await parseXLSX(file, platform);
    } else {
      throw new Error('Format non reconnu. Utilise .csv, .json, .xlsx ou .zip');
    }

    if (posts.length === 0) throw new Error('Aucun post trouvé dans ce fichier. Vérifie le format.');

    // Fusionne avec les données existantes
    const existing = get(postsKey(accountKey), []);
    const existingDates = new Set(existing.map(p => p.date + '_' + (p.text||'').substring(0,20)));
    const newPosts = posts.filter(p => !existingDates.has(p.date + '_' + (p.text||'').substring(0,20)));

    set(postsKey(accountKey), [...existing, ...newPosts]);
    set(`last_import_${accountKey}`, Date.now());

    showToast(`✓ ${newPosts.length} posts importés (${posts.length} dans le fichier)`);
    renderModule();
  } catch(e) {
    showToast('❌ ' + e.message);
    if (zone) zone.innerHTML = `<div class="drop-icon">❌</div><div class="drop-text" style="color:#ff4d6a">${e.message}</div><input type="file" class="drop-input" id="file_${accountKey}" data-account="${accountKey}" data-platform="${platform}" />`;
    const inp = document.getElementById(`file_${accountKey}`);
    if (inp) inp.addEventListener('change', e2 => { const f = e2.target.files[0]; if (f) processFile(f, accountKey, platform); });
  }
}

function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Impossible de lire le fichier'));
    reader.readAsText(file, 'UTF-8');
  });
}

function readFileArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Impossible de lire le fichier'));
    reader.readAsArrayBuffer(file);
  });
}

// ── PARSEURS ─────────────────────────────────────────────

// TikTok JSON (export "Download your data")
function parseTikTokJSON(json) {
  const posts = [];

  // Format standard TikTok data export
  const videoList =
    json?.Video?.Videos?.VideoList ||
    json?.['Activity']?.['Video Browsing History']?.['VideoList'] ||
    json?.video?.videos?.videoList || [];

  for (const v of videoList) {
    const date = v.Date ? new Date(v.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    posts.push({
      text: v.Caption || v.Description || v.Link || '',
      format: 'Vidéo',
      date,
      vues: +v.Plays || +v.Views || 0,
      likes: +v.Likes || +v.DiggCount || 0,
      commentaires: +v.Comments || +v.CommentCount || 0,
      partages: +v.Shares || +v.ShareCount || 0,
      sauvegardes: +v.Saves || 0,
      source: 'tiktok_json',
    });
  }

  // Format analytics JSON (autre structure possible)
  if (posts.length === 0 && json?.data) {
    for (const v of json.data) {
      posts.push({
        text: v.video_description || v.title || '',
        format: 'Vidéo',
        date: v.create_time ? new Date(v.create_time * 1000).toISOString().split('T')[0] : '',
        vues: +v.view_count || 0,
        likes: +v.like_count || +v.digg_count || 0,
        commentaires: +v.comment_count || 0,
        partages: +v.share_count || 0,
        sauvegardes: +v.collect_count || 0,
        source: 'tiktok_json',
      });
    }
  }

  return posts;
}

// CSV universel (TikTok Analytics ou LinkedIn)
function parseCSV(text, platform) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  // Détecte le séparateur
  const sep = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, ''));

  const posts = [];
  for (let i = 1; i < lines.length; i++) {
    const values = smartSplit(lines[i], sep);
    if (values.length < 2) continue;

    const row = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] || '').trim().replace(/^["']|["']$/g, ''); });

    const post = platform === 'tiktok' ? parseTikTokCSVRow(row) : parseLinkedInCSVRow(row);
    if (post && post.date) posts.push(post);
  }

  return posts;
}

function parseTikTokCSVRow(row) {
  // TikTok Analytics CSV : video_title/title, date, video_views/views, likes, comments, shares
  const dateRaw = row.date || row.publish_date || row.created_at || row.time || '';
  const date = parseDate(dateRaw);
  if (!date) return null;

  return {
    text: row.video_title || row.title || row.video_description || row.content || '',
    format: 'Vidéo',
    date,
    vues:          +normalize(row.video_views || row.views || row.play_count || '0'),
    likes:         +normalize(row.likes || row.like_count || row.digg_count || '0'),
    commentaires:  +normalize(row.comments || row.comment_count || '0'),
    partages:      +normalize(row.shares || row.share_count || '0'),
    sauvegardes:   +normalize(row.saves || row.collect_count || row.saved || '0'),
    source: 'tiktok_csv',
  };
}

function parseLinkedInCSVRow(row) {
  // LinkedIn Analytics CSV : post content, date, impressions, reactions, comments, reposts/shares, clicks
  const dateRaw = row.date || row.created_date || row.published_date || row.post_date || row.created_at || '';
  const date = parseDate(dateRaw);
  if (!date) return null;

  const text = row.post_content || row.content || row.post_url || row.description || '';
  const format = guessLinkedInFormat(row.post_type || row.type || '');

  return {
    text: text.substring(0, 150),
    format,
    date,
    vues:         +normalize(row.impressions || row.views || row.impression_count || '0'),
    likes:        +normalize(row.reactions || row.likes || row.reaction_count || '0'),
    commentaires: +normalize(row.comments || row.comment_count || '0'),
    partages:     +normalize(row.reposts || row.shares || row.reshares || row.repost_count || '0'),
    sauvegardes:  0,
    clics:        +normalize(row.clicks || row.click_count || '0'),
    source: 'linkedin_csv',
  };
}

function guessLinkedInFormat(type) {
  if (!type) return 'Post texte';
  const t = type.toLowerCase();
  if (t.includes('video')) return 'Vidéo';
  if (t.includes('article')) return 'Article';
  if (t.includes('image') || t.includes('photo')) return 'Image';
  if (t.includes('document') || t.includes('carousel')) return 'Carrousel';
  return 'Post texte';
}

// TikTok ZIP
async function parseTikTokZip(file) {
  // Charge JSZip dynamiquement si pas déjà présent
  if (!window.JSZip) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
  }

  const arrayBuffer = await readFileArrayBuffer(file);
  const zip = await JSZip.loadAsync(arrayBuffer);
  let posts = [];

  for (const [filename, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;

    if (filename.endsWith('.json')) {
      const text = await zipEntry.async('text');
      try {
        const json = JSON.parse(text);
        const p = parseTikTokJSON(json);
        posts = [...posts, ...p];
      } catch {}
    } else if (filename.endsWith('.csv')) {
      const text = await zipEntry.async('text');
      const p = parseCSV(text, 'tiktok');
      posts = [...posts, ...p];
    }
  }

  return posts;
}

// XLSX
async function parseXLSX(file, platform) {
  if (!window.XLSX) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  }

  const arrayBuffer = await readFileArrayBuffer(file);
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const csvText = XLSX.utils.sheet_to_csv(sheet);
  return parseCSV(csvText, platform);
}

// ── UTILS PARSING ─────────────────────────────────────────
function parseDate(raw) {
  if (!raw) return null;
  const s = raw.toString().trim();
  if (!s) return null;

  // ISO
  let d = new Date(s);
  if (!isNaN(d)) return d.toISOString().split('T')[0];

  // DD/MM/YYYY
  const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m1) {
    const year = m1[3].length === 2 ? '20' + m1[3] : m1[3];
    d = new Date(`${year}-${m1[2].padStart(2,'0')}-${m1[1].padStart(2,'0')}`);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  }

  // YYYY/MM/DD
  const m2 = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m2) {
    d = new Date(`${m2[1]}-${m2[2].padStart(2,'0')}-${m2[3].padStart(2,'0')}`);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  }

  // Excel serial date
  const num = parseFloat(s);
  if (!isNaN(num) && num > 40000 && num < 60000) {
    d = new Date((num - 25569) * 86400 * 1000);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  }

  return null;
}

function normalize(val) {
  return String(val).replace(/[^0-9.]/g, '') || '0';
}

function smartSplit(line, sep) {
  const result = [];
  let current = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuote = !inQuote; }
    else if (ch === sep && !inQuote) { result.push(current); current = ''; }
    else { current += ch; }
  }
  result.push(current);
  return result;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── BIND EVENTS CONNEXION ─────────────────────────────────
window.bindConnexionEvents = function() {
  // Guides toggle
  const toggles = [
    ['showInstaSetup',   'instaSetupGuide'],
    ['showTikTokHelp',   'tiktokHelpGuide'],
    ['showLinkedInHelp', 'linkedinHelpGuide'],
  ];
  toggles.forEach(([btnId, guideId]) => {
    document.getElementById(btnId)?.addEventListener('click', () => {
      const guide = document.getElementById(guideId);
      if (!guide) return;
      guide.style.display = guide.style.display === 'none' ? 'block' : 'none';
    });
  });

  // Sauvegarde App ID Meta
  document.getElementById('saveMetaAppId')?.addEventListener('click', () => {
    const appId = document.getElementById('metaAppId')?.value.trim();
    const s = get('settings', {});
    set('settings', { ...s, metaAppId: appId });
    showToast('App ID sauvegardé ✓');
  });

  // Drop zones
  initDropZones();
};

// ── INIT AU CHARGEMENT ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  handleOAuthCallback();
});
