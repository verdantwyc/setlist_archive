// ═══════════════════════════════════════════════════════════
// VERDANT MUSIC MUSEUM — main.js
//
// File structure:
//   data/series.json         — series list + venue metadata
//   data/setlists/{id}.json  — one setlist per venue (loaded on demand)
//   data/tracks.json         — tracksInfo (multilang song details)
//   data/artists.json        — artist details (multilang)
//   data/museum.json         — museum name + description
//
// Setlist track format:
//   { titleCn, performer, genre, showOriginal, originalType, isPV, links? }
//   links is optional fallback data; page prefers the current links in data/tracks.json.
//   originalType: "original" reads track.vocalist; "composer" reads track.composer, then track.lyricist.
// ═══════════════════════════════════════════════════════════

'use strict';

// ─── I18N ────────────────────────────────────────────────
let currentLang = 'zh_cn';
const UI = {
  nav_home_t:   {zh_cn:'首页',zh_tw:'首頁',en:'Home'},
  nav_tracks_t: {zh_cn:'曲库',zh_tw:'曲庫',en:'Tracks'},
  nav_artists_t:{zh_cn:'创作者',zh_tw:'創作者',en:'Creators'},
  prog_index:   {zh_cn:'演出系列索引',zh_tw:'演出系列索引',en:'Program Index'},
  venue_note:   {zh_cn:'备注',zh_tw:'備註',en:'Note'},
  venue_index:  {zh_cn:'场次索引',zh_tw:'場次索引',en:'Venue Index'},
  tracks_main:  {zh_cn:'演出曲目',zh_tw:'演出曲目',en:'Main Set'},
  encore:       {zh_cn:'安可曲',zh_tw:'安可曲',en:'Encore'},
  tracks_count: {zh_cn:'首',zh_tw:'首',en:'tracks'},
  venues_count: {zh_cn:'场次',zh_tw:'場次',en:'stops'},
  n_venues:     {zh_cn:'场次演出',zh_tw:'場次演出',en:'stops'},
  n_works:      {zh_cn:'作品',zh_tw:'作品',en:'works'},
  no_data:      {zh_cn:'暂无数据',zh_tw:'暫無資料',en:'No data'},
  loading:      {zh_cn:'载入中…',zh_tw:'載入中…',en:'Loading…'},
  cancel:       {zh_cn:'取消',zh_tw:'取消',en:'Cancel'},
  save:         {zh_cn:'保存',zh_tw:'儲存',en:'Save'},
  performer:    {zh_cn:'演出',zh_tw:'演出',en:'Live'},
  cr_original:  {zh_cn:'原唱',zh_tw:'原唱',en:'Orig. Artist'},
  cr_composer:  {zh_cn:'原作',zh_tw:'原作',en:'Orig. Creator'},
  badge_archive:{zh_cn:'典藏',zh_tw:'典藏',en:'Archive'},
  badge_live:   {zh_cn:'现正演出',zh_tw:'現正演出',en:'Live Now'},
  badge_coming: {zh_cn:'即将到来',zh_tw:'即將到來',en:'Coming Soon'},
  listen_on:    {zh_cn:'收听：',zh_tw:'收聽：',en:'Listen:'},
  appears_in:   {zh_cn:'🎤 现场演出纪录',zh_tw:'🎤 現場演出紀錄',en:'🎤 Live Performances'},
  appears_bgm:  {zh_cn:'🎬 以BGM/PV出现',zh_tw:'🎬 以BGM/PV出現',en:'🎬 As BGM/PV'},
  performed_in: {zh_cn:'参演场次',zh_tw:'參演場次',en:'Performed In'},
  rel_works:    {zh_cn:'相关作品',zh_tw:'相關作品',en:'Related Works'},
  all_tab:      {zh_cn:'全部',zh_tw:'全部',en:'All'},
  alias:        {zh_cn:'又名',zh_tw:'又名',en:'AKA'},
  filter_all:   {zh_cn:'全部曲目',zh_tw:'全部曲目',en:'All Tracks'},
  filter_orig:  {zh_cn:'原创专区',zh_tw:'原創專區',en:'Originals'},
  tk_singer:    {zh_cn:'演唱',zh_tw:'演唱',en:'Vocalist'},
  tk_lyricist:  {zh_cn:'作词',zh_tw:'作詞',en:'Lyricist'},
  tk_composer:  {zh_cn:'作曲',zh_tw:'作曲',en:'Composer'},
  tk_arranger:  {zh_cn:'编曲',zh_tw:'編曲',en:'Arranger'},
  tk_album:     {zh_cn:'专辑',zh_tw:'專輯',en:'Album'},
  tk_intro:     {zh_cn:'说明',zh_tw:'說明',en:'Note'},
  pv_tag:       {zh_cn:'PV',zh_tw:'PV',en:'PV'},
  notice_title: {zh_cn:'观展指南 & 歌单说明',zh_tw:'觀展指南 & 歌單說明',en:'Guide & Notes'},
  notice_desc:  {
    zh_cn:'只要原唱或原作同为演出者即会列为"原唱"；随舞或舞蹈串烧用到的背景音乐列为"BGM"，参与作词或作曲都会列入"原创"。各歌名以官方为准，创作者及歌曲英译以官方或平台使用的英文名为优先，若无则采取本站直译。<br><br>歌单可能存在错误，若您有相关记录欢迎通过问卷反馈，苍站会不定时更新！',
    zh_tw:'只要原唱或原作同為演出者即會列為「原唱」；隨舞或舞蹈串燒用到的背景音樂列為「BGM」，參與作詞或作曲都會列入「原創」。各歌名以官方為準，創作者及歌曲英譯以官方或平台使用的英文名為優先，若無則採取本站直譯。<br><br>歌單可能存在錯誤，若您有相關記錄歡迎通過問卷回報，蒼站會不定時更新！',
    en:'If the original singer is also the performer, it is listed as "Orig. Artist". BGM for dance sets is labeled "BGM". Song titles follow official releases; English names prioritize official versions.<br><br>Setlists may contain errors — report via survey and we update periodically!'
  },
  btn_report:   {zh_cn:'✉️ 立即反馈',zh_tw:'✉️ 立即回報',en:'✉️ Report Error'},
  genre: {
    zh_cn:{'原创':'原创','翻唱':'翻唱','原唱':'原唱','BGM':'BGM'},
    zh_tw:{'原创':'原創','翻唱':'翻唱','原唱':'原唱','BGM':'BGM'},
    en:   {'原创':'Original Work','翻唱':'Cover','原唱':'Original','BGM':'BGM'}
  },
  // Additional missing i18n
  pub_lib_title:  {zh_cn:'🎵 音乐曲库',zh_tw:'🎵 音樂曲庫',en:'🎵 Track Library'},
  pub_art_title:  {zh_cn:'👤 创作者列表',zh_tw:'👤 創作者列表',en:'👤 Creators'},
  search_track:   {zh_cn:'输入歌名搜索...',zh_tw:'輸入歌名搜尋...',en:'Search tracks...'},
  search_artist:  {zh_cn:'输入人员名称搜索...',zh_tw:'輸入人員名稱搜尋...',en:'Search creators...'},
  btn_report:     {zh_cn:'✉️ 立即反馈',zh_tw:'✉️ 立即回報',en:'✉️ Report Error'},
  venue_word:     {zh_cn:'场次',zh_tw:'場次',en:'stop'},
  venues_word:    {zh_cn:'场次',zh_tw:'場次',en:'stops'},
  series_word:    {zh_cn:'个系列',zh_tw:'個系列',en:'series'}
};

function t(k){const e=UI[k];if(!e)return k;return e[currentLang]||e.zh_cn||k;}
function tl(o){if(!o)return '';if(typeof o==='string')return o;return o[currentLang]||o.zh_cn||o.en||'';}
function gs(o,l){if(!o)return '';if(typeof o==='string')return o;return o[l]||o.zh_cn||'';}
function gl(g){const m=(UI.genre||{})[currentLang]||(UI.genre||{}).zh_cn||{};return m[g]||g;}
function esc(s){return(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function csv(s){return(s||'').split(/[,，、;；\n]+/).map(x=>x.trim()).filter(Boolean);}
function safeId(s){return encodeURIComponent(String(s||'')).replace(/%/g,'_');}
function fmtDate(d){
  if(!d)return'';
  const m=d.match(/^(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})$/);if(!m)return d;
  const M=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const mi=parseInt(m[2],10);return mi>=1&&mi<=12?`${m[1]} ${M[mi-1]} ${m[3].padStart(2,'0')}`:d;
}

// ─── DATA STORE ──────────────────────────────────────────
let DB = {museum:{museumName:{},museumDesc:{}}, series:[], tracks:[], artists:[]};
// Setlist cache: venueId → {tracks, encore}
const setlistCache = {};

let currentSeriesId = null, currentVenueId = null;
let trackLibFilter = 'all';
let artistLookup = new Map();
let trackLookup = new Map();
let worksByArtist = {};
let relationDirty = true;
let relationIndex = {track:{}, artist:{}};

const GENRE_CSS = {'原创':'g-original','原唱':'g-orig-singer','翻唱':'g-cover','BGM':'g-bgm'};
const PLATFORMS = {
  qq:{zh_cn:'QQ音乐',zh_tw:'QQ音樂',en:'QQ Music'},
  netease:{zh_cn:'网易云',zh_tw:'網易雲',en:'NetEase'},
  spotify:{zh_cn:'Spotify',zh_tw:'Spotify',en:'Spotify'}
};

// ─── LOOKUP HELPERS ──────────────────────────────────────
function normKey(s){return String(s||'').trim().replace(/\s+/g,' ').toLowerCase();}
function langValues(o){return o&&typeof o==='object'?[o.zh_cn,o.zh_tw,o.en].filter(Boolean):[];}
function addLookup(map,key,value){const k=normKey(key);if(k&&!map.has(k))map.set(k,value);}
function buildLookups(){
  artistLookup=new Map();trackLookup=new Map();worksByArtist={};
  DB.artists.forEach(a=>{
    [a.zh_cn,a.zh_tw,a.en,...langValues(a.aliases).flatMap(csv)].forEach(v=>addLookup(artistLookup,v,a));
  });
  DB.tracks.forEach(ti=>{
    [ti.zh_cn,ti.zh_tw,ti.en].forEach(v=>addLookup(trackLookup,v,ti));
    ['vocalist','lyricist','composer','arranger'].forEach(r=>{
      csv(gs(ti[r],'zh_cn')).map(canonArtist).forEach(cn=>{
        if(!cn)return;
        if(!worksByArtist[cn])worksByArtist[cn]={all:[],vocalist:[],lyricist:[],composer:[],arranger:[]};
        worksByArtist[cn][r].push(ti);
        if(!worksByArtist[cn].all.some(x=>x.zh_cn===ti.zh_cn))worksByArtist[cn].all.push(ti);
      });
    });
  });
}
function getArtist(cn){
  const k=normKey(cn);if(!k)return null;
  if(artistLookup.has(k))return artistLookup.get(k);
  return DB.artists.find(a=>
    [a.zh_cn,a.zh_tw,a.en,...langValues(a.aliases).flatMap(csv)].some(v=>normKey(v)===k)
  )||null;
}
function getTrack(cn){
  const k=normKey(cn);if(!k)return null;
  if(trackLookup.has(k))return trackLookup.get(k);
  return DB.tracks.find(t=>[t.zh_cn,t.zh_tw,t.en].some(v=>normKey(v)===k))||null;
}
function canonArtist(cn){const a=getArtist(cn);return a?a.zh_cn:String(cn||'').trim();}
function canonTrack(cn){const t=getTrack(cn);return t?t.zh_cn:String(cn||'').trim();}
function artistName(cn){
  const a=getArtist(cn);if(!a)return cn;
  return currentLang==='en'?(a.en||cn):currentLang==='zh_tw'?(a.zh_tw||cn):cn;
}
function displayTrackName(cn){
  const ti=getTrack(cn);
  return ti?tl({zh_cn:ti.zh_cn,zh_tw:ti.zh_tw,en:ti.en}):cn;
}
function resolveNames(cnStr, link=false){
  if(!cnStr)return'';
  return csv(cnStr).map(cn=>{
    const dn=artistName(cn);
    if(link){const a=getArtist(cn);if(a){const key=a.zh_cn||cn;return`<span class="artist-link" onclick="openArtistCard('${esc(key)}')">${dn}</span>`;}}
    return dn;
  }).join(', ');
}
function resolveField(f,link=false){return resolveNames(gs(f,'zh_cn'),link);}
function buildML(cnStr){
  if(!cnStr||!cnStr.trim())return{zh_cn:'',zh_tw:'',en:''};
  const p=csv(cnStr),tw=[],en=[];
  p.forEach(n=>{const a=getArtist(n);tw.push(a&&a.zh_tw?a.zh_tw:n);en.push(a&&a.en?a.en:n);});
  return{zh_cn:p.join(', '),zh_tw:tw.join(', '),en:en.join(', ')};
}
function normalizeNameList(s, resolver){return csv(s).map(resolver).filter(Boolean).join(', ');}
function normalizeSetlistTrack(tk){
  const nt={...migrateTrack(tk||{})};
  nt.titleCn=normalizeNameList(nt.titleCn,canonTrack);
  nt.performer=normalizeNameList(nt.performer,canonArtist);
  nt.genre=nt.genre||'原创';
  nt.originalType=nt.originalType||nt.creditType||'original';
  nt.showOriginal=!!nt.showOriginal||(nt.genre==='翻唱'||nt.genre==='原唱');
  nt.isPV=!!nt.isPV;
  return nt;
}
function normalizeSetlist(sl, venueId){
  const n=sl||{};
  n.venueId=n.venueId||venueId;
  n.tracks=(n.tracks||[]).map(normalizeSetlistTrack);
  n.encore=(n.encore||[]).map(normalizeSetlistTrack);
  return n;
}
function mergeLinks(...groups){
  const seen=new Set(),out=[];
  groups.flat().filter(Boolean).forEach(l=>{
    const key=`${l.platform||''}|${l.url||''}`;
    if(l.url&&!seen.has(key)){seen.add(key);out.push(l);}
  });
  return out;
}
function trackLinks(tk){
  const titles=csv(tk.titleCn||'');
  if(titles.length!==1)return[];
  const titleLinks=titles.flatMap(cn=>((getTrack(cn)||{}).links)||[]);
  return titleLinks.length?mergeLinks(titleLinks):mergeLinks(tk.links||[]);
}
function originalCreditField(tk, ti){
  const type=tk.originalType||tk.creditType||(ti&&ti.creditType)||'original';
  if(type==='composer')return gs(ti.composer,'zh_cn')?ti.composer:ti.lyricist;
  return ti.vocalist;
}
function originalCreditLabel(tk, ti){
  const type=tk.originalType||tk.creditType||(ti&&ti.creditType)||'original';
  return type==='composer'?t('cr_composer'):t('cr_original');
}
function originalCreditItems(tk){
  if(!tk.showOriginal)return[];
  const groups={};
  csv(tk.titleCn||'').forEach(title=>{
    const ti=getTrack(title);
    if(!ti)return;
    const field=originalCreditField(tk,ti);
    const cn=gs(field,'zh_cn');
    if(!cn)return;
    const label=originalCreditLabel(tk,ti);
    if(!groups[label])groups[label]={label,field:{zh_cn:'',zh_tw:'',en:''},seen:new Set()};
    csv(cn).forEach(name=>{
      const key=canonArtist(name);
      if(!key||groups[label].seen.has(key))return;
      const a=getArtist(name);
      groups[label].seen.add(key);
      ['zh_cn','zh_tw','en'].forEach(lang=>{
        const val=a?(a[lang]||a.zh_cn||name):name;
        groups[label].field[lang]=groups[label].field[lang]?`${groups[label].field[lang]}, ${val}`:val;
      });
    });
  });
  return Object.values(groups).filter(item=>gs(item.field,'zh_cn'));
}
function venueCounts(v){
  const sl=setlistCache[v.id];
  if(sl)return{tracks:(sl.tracks||[]).length,encore:(sl.encore||[]).length,total:(sl.tracks||[]).length+(sl.encore||[]).length,known:true};
  if(v.tracks||v.encore)return{tracks:(v.tracks||[]).length,encore:(v.encore||[]).length,total:(v.tracks||[]).length+(v.encore||[]).length,known:true};
  return{tracks:0,encore:0,total:0,known:false};
}
function trackCountText(c){return`${c.known?c.total:'…'} ${t('tracks_count')}`;}

// ─── BADGES ──────────────────────────────────────────────
function normBadge(b){const s=(typeof b==='string'?b:'').toLowerCase();return s.includes('live')||s.includes('现正')?'live':s.includes('coming')||s.includes('即将')?'coming_soon':'archive';}
function isToday(d){
  if(!d)return false;
  const now=new Date(),g=new Date(now.getTime()+(8*60-now.getTimezoneOffset())*60000);
  const today=g.toISOString().slice(0,10);
  const n=d.replace(/[./]/g,'-').replace(/^(\d{4})-(\d{1,2})-(\d{1,2})$/,(_,y,m,d)=>`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);
  return n===today;
}
function effBadge(v){return isToday(v.date)?'live':normBadge(v.badge);}
function badgePill(b){
  if(b==='live')return`<span class="status-tag status-live"><span class="status-dot"></span>${t('badge_live')}</span>`;
  if(b==='coming_soon')return`<span class="status-tag status-coming">⟳ ${t('badge_coming')}</span>`;
  return`<span class="status-tag status-archive">◎ ${t('badge_archive')}</span>`;
}
function venueNote(v){return tl(v.note||v.remark||v.remarks||v.concertNameEn||{});}
function openExternal(url){
  if(url)window.open(url,'_blank','noopener,noreferrer');
}
function jsArg(s){return String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r?\n/g,' ');}
function streamLinks(links){
  if(!links||!links.length)return'';
  const ic={qq:'🎶',netease:'☁️',spotify:'S'},cl={qq:'sb-qq',netease:'sb-netease',spotify:'sb-spotify'};
  return links.map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();openExternal('${jsArg(l.url)}');return false;" class="stream-btn-icon ${cl[l.platform]||''}" title="${tl(PLATFORMS[l.platform])||l.platform}">${ic[l.platform]||'🔗'}</a>`).join('');
}
function markRelationsDirty(){relationDirty=true;}
function rebuildRelationIndex(){
  const idx={track:{},artist:{}};
  DB.series.forEach(s=>(s.venues||[]).forEach(v=>{
    const sl=setlistCache[v.id];if(!sl)return;
    [...(sl.tracks||[]),...(sl.encore||[])].forEach(tk=>{
      const item={sid:s.id,vid:v.id,sName:s.name,vName:v.name,date:v.date};
      csv(tk.titleCn||'').map(canonTrack).forEach(cn=>{
        if(!cn)return;
        if(!idx.track[cn])idx.track[cn]={app:[],bgm:[]};
        (tk.genre==='BGM'||tk.isPV?idx.track[cn].bgm:idx.track[cn].app).push(item);
      });
      csv(tk.performer||'').map(canonArtist).forEach(cn=>{
        if(!cn)return;
        if(!idx.artist[cn])idx.artist[cn]=[];
        if(!idx.artist[cn].some(x=>x.vid===v.id))idx.artist[cn].push(item);
      });
    });
  }));
  relationIndex=idx;relationDirty=false;
}
function ensureRelationIndex(){if(relationDirty)rebuildRelationIndex();return relationIndex;}

// ─── SYNC ────────────────────────────────────────────────
function syncTracksFromSetlist(tracks,encore){
  [...(tracks||[]),...(encore||[])].map(normalizeSetlistTrack).forEach(tk=>{
    csv(tk.titleCn||'').forEach(cn=>{
      if(!cn||getTrack(cn))return;
      DB.tracks.push({zh_cn:cn,zh_tw:cn,en:cn,genre:tk.genre||'原创',vocalist:{},lyricist:{},composer:{},arranger:{},album:{},intro:{},links:[]});
    });
    csv(tk.performer||'').forEach(cn=>{if(!cn||getArtist(cn))return;DB.artists.push({zh_cn:cn,zh_tw:cn,en:cn,intro:{},aliases:{}});});
  });
}
function syncArtistsFromTracks(){
  DB.tracks.forEach(ti=>['vocalist','lyricist','composer','arranger'].forEach(r=>{
    csv(gs(ti[r],'zh_cn')).forEach(cn=>{if(!cn||getArtist(cn))return;DB.artists.push({zh_cn:cn,zh_tw:cn,en:cn,intro:{},aliases:{}});});
  }));
}
function refreshTracksML(){
  DB.tracks.forEach(ti=>['vocalist','lyricist','composer','arranger'].forEach(r=>{
    const cn=gs(ti[r],'zh_cn');
    if(!cn){ti[r]={zh_cn:'',zh_tw:'',en:''};return;}
    const f=buildML(cn);ti[r]={zh_cn:cn,zh_tw:f.zh_tw||cn,en:f.en||cn};
  }));
}
function sortArtists(){
  const c={};
  DB.series.forEach(s=>(s.venues||[]).forEach(v=>{
    const sl=setlistCache[v.id];
    if(sl){[...(sl.tracks||[]),...(sl.encore||[])].forEach(tk=>csv(tk.performer||'').forEach(cn=>{c[cn]=(c[cn]||0)+1;}));}
  }));
  DB.tracks.forEach(ti=>['vocalist','lyricist','composer','arranger'].forEach(r=>csv(gs(ti[r],'zh_cn')).forEach(cn=>{c[cn]=(c[cn]||0)+1;})));
  DB.artists.sort((a,b)=>{if(a.zh_cn==='王允宸')return-1;if(b.zh_cn==='王允宸')return 1;return(c[b.zh_cn]||0)-(c[a.zh_cn]||0);});
}
function sortTracks(){
  const c={};
  DB.series.forEach(s=>(s.venues||[]).forEach(v=>{
    const sl=setlistCache[v.id];
    if(sl){[...(sl.tracks||[]),...(sl.encore||[])].forEach(tk=>csv(tk.titleCn||'').forEach(cn=>{c[cn]=(c[cn]||0)+1;}));}
  }));
  DB.tracks.sort((a,b)=>(c[b.zh_cn]||0)-(c[a.zh_cn]||0));
}

// ─── LOADING ─────────────────────────────────────────────
// Load static data first (series + tracks + artists + museum) — all small/medium files
// Setlists are loaded on demand when user opens a venue
async function loadStaticData(){
  showLoader(true);
  const tryFetch = async (url) => {
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok)throw new Error(`${url} returned ${r.status}`);
    return await r.json();
  };

  try{
    const [museum, series, tracks, artists] = await Promise.all([
      tryFetch('data/museum.json'),
      tryFetch('data/series.json'),
      tryFetch('data/tracks.json'),
      tryFetch('data/artists.json'),
    ]);
    applyStatic({museum,series,tracks,artists});
    syncArtistsFromTracks(); refreshTracksML(); buildLookups(); sortArtists();
    showLoader(false);
    return true;
  }catch(e){
    showLoadError(e);
    return false;
  }
}

function applyStatic({museum,series,tracks,artists}){
  DB.museum  = museum||{museumName:{},museumDesc:{}};
  DB.series  = (series||[]).map(s=>{if(!s.id)s.id='s-'+Math.random().toString(36).slice(2);(s.venues||[]).forEach(v=>{if(!v.id)v.id='v-'+Math.random().toString(36).slice(2);v.badge=normBadge(v.badge||'archive');});return s;});
  DB.tracks  = tracks||[];
  DB.artists = artists||[];
}

// Load a setlist on demand (with caching)
async function loadSetlist(venueId){
  // Already cached in memory
  if(setlistCache[venueId]) return setlistCache[venueId];
  // Fetch from network
  try{
    const r=await fetch(`data/setlists/${venueId}.json`,{cache:'no-store'});
    if(r.ok){
      const sl=normalizeSetlist(await r.json(),venueId);
      setlistCache[venueId]=sl;
      markRelationsDirty();
      return sl;
    }
  }catch(e){}
  const empty={venueId, seriesId:null, tracks:[], encore:[]};
  setlistCache[venueId]=empty;
  markRelationsDirty();
  return empty;
}

function migrateTrack(tk){
  if('titleCn' in tk)return tk;
  const cn=gs(tk.title,'zh_cn')||(typeof tk.title==='string'?tk.title:'');
  const p=gs(tk.performer,'zh_cn')||(typeof tk.performer==='string'?tk.performer:'');
  const g=tk.genre||'原创';
  const r={titleCn:cn,performer:p,genre:g,showOriginal:!!(tk.showOriginal)||(g==='翻唱'||g==='原唱'),originalType:tk.originalType||tk.creditType||'original',isPV:!!(tk.isPV)};
  if(tk.links&&tk.links.length)r.links=tk.links;
  return r;
}

// ─── LOADING SCREEN ──────────────────────────────────────
function showLoader(show, msg){
  let el=document.getElementById('page-loader');
  if(!el){
    el=document.createElement('div'); el.id='page-loader';
    el.innerHTML=`<div class="loader-inner"><div class="loader-vinyl"></div><div class="loader-text"></div></div>`;
    el.style.cssText='position:fixed;inset:0;background:var(--bg);z-index:9999;display:flex;align-items:center;justify-content:center;transition:opacity 0.4s;';
    el.querySelector('.loader-vinyl').style.cssText='width:60px;height:60px;border-radius:50%;background:conic-gradient(#2d0a1a 0deg,#400d22 90deg,#1a0510 180deg,#0d0208 270deg,#2d0a1a 360deg);animation:spin 2s linear infinite;position:relative;box-shadow:0 0 20px rgba(147,5,49,0.4);';
    el.querySelector('.loader-vinyl').innerHTML='<div style="position:absolute;inset:20px;border-radius:50%;background:radial-gradient(var(--ember),var(--crimson) 40%,#1a0510 70%);"></div>';
    el.querySelector('.loader-text').style.cssText='margin-top:20px;font-family:var(--font-sans);font-size:14px;color:var(--text-muted);letter-spacing:2px;';
    document.body.appendChild(el);
  }
  el.querySelector('.loader-text').textContent=msg||t('loading');
  el.style.display=show?'flex':'none';
  el.style.opacity=show?'1':'0';
}
function showLoadError(err){
  let el=document.getElementById('page-loader');
  if(!el){showLoader(true);el=document.getElementById('page-loader');}
  el.style.display='flex';el.style.opacity='1';
  el.querySelector('.loader-inner').innerHTML=
    `<div style="max-width:520px;padding:28px;text-align:left;background:var(--surface);border:1px solid var(--border-bright);border-radius:16px;color:var(--text-dim);font-family:var(--font-sans);line-height:1.7;">
      <div style="font-size:18px;font-weight:800;color:var(--ivory);margin-bottom:10px;">JSON 资料载入失败</div>
      <div style="font-size:13px;margin-bottom:10px;">网页现在只读取 <code>data/</code> 资料夹内的 JSON，不再使用 index.html 内嵌资料。</div>
      <div style="font-size:12px;color:var(--text-muted);">若你是直接打开 file://，请改用本地静态服务器预览；部署到 GitHub Pages 后会正常读取外部 JSON。</div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:12px;">${esc(err&&err.message?err.message:String(err||''))}</div>
    </div>`;
}
function showVenueLoader(show){
  const grid=document.getElementById('gridTracks'),enc=document.getElementById('gridEncore');
  const html=show?`<div style="text-align:center;padding:40px;color:var(--text-muted);"><div style="font-size:28px;animation:spin 1.5s linear infinite;display:inline-block;">⟳</div><div style="margin-top:12px;font-size:13px;letter-spacing:2px;">${t('loading')}</div></div>`:'';
  if(grid)grid.innerHTML=html; if(enc)enc.innerHTML='';
}
function setBusy(show){
  document.body.classList.toggle('is-busy',!!show);
  const el=document.getElementById('view-busy-text');
  if(el)el.textContent=t('loading');
}
function deferRender(fn){
  setBusy(true);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    try{fn();}finally{setBusy(false);}
  }));
}

// ─── NAVIGATION ──────────────────────────────────────────
window.setLang=function(lang){
  currentLang=lang;
  document.body.setAttribute('lang',lang==='zh_cn'?'zh-cn':lang==='zh_tw'?'zh-tw':'en');
  document.querySelectorAll('.lang-btn').forEach(b=>{
    const txt=b.textContent.trim();
    b.classList.toggle('active',lang==='zh_cn'?txt==='简':lang==='zh_tw'?txt==='繁':txt==='En');
  });
  deferRender(()=>{updateNavTitles(); updateStaticUI(); rerenderActive();});
};
function updateStaticUI(){
  const set=(id,v)=>{const el=document.getElementById(id);if(el&&v!==undefined)el.innerHTML=v;};
  const ph=(id,v)=>{const el=document.getElementById(id);if(el&&v)el.placeholder=v;};
  set('pub-lib-title', t('pub_lib_title'));
  set('pub-art-title', t('pub_art_title'));
  set('flt-all', t('filter_all'));
  set('flt-original', t('filter_orig'));
  set('cv-idx-label', t('prog_index'));
  set('sv-idx-label', t('venue_index'));
  set('notice-title', t('notice_title'));
  const nd=document.getElementById('notice-desc');if(nd)nd.innerHTML=t('notice_desc');
  const rp=document.getElementById('btn-report');if(rp)rp.textContent=t('btn_report');
  ph('pub-lib-search', t('search_track'));
  ph('pub-art-search', t('search_artist'));
}
function updateNavTitles(){
  [['nav-home','nav_home_t'],['nav-tracks','nav_tracks_t'],['nav-artists','nav_artists_t']].forEach(([id,k])=>{const el=document.getElementById(id);if(el)el.title=t(k);});
}
function rerenderActive(){
  const a=document.querySelector('.view.active');if(!a)return;
  const id=a.id;
  if(id==='view-cover')renderCover();
  else if(id==='view-series')renderSeriesView(currentSeriesId);
  else if(id==='view-program')renderProgramView(currentSeriesId,currentVenueId);
  else if(id==='view-track-lib')renderPublicTrackLib();
  else if(id==='view-artist-lib')renderPublicArtistLib();
}
function switchView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById(id)&&document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const map={'view-cover':'nav-home','view-track-lib':'nav-tracks','view-artist-lib':'nav-artists'};
  if(map[id])document.getElementById(map[id])&&document.getElementById(map[id]).classList.add('active');
}
function switchMainView(id){switchView(id);deferRender(rerenderActive);}
function openArtistCard(cn){
  switchView('view-artist-lib');
  deferRender(()=>{
    renderPublicArtistLib();
    requestAnimationFrame(()=>{const el=document.getElementById('artist-card-'+safeId(cn));if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('expanded');}});
  });
}
function goToTrackLib(cn){
  switchView('view-track-lib');
  deferRender(()=>{
    renderPublicTrackLib();
    requestAnimationFrame(()=>{document.querySelectorAll('.lib-card').forEach(el=>{if(el.dataset.titleCn===canonTrack(cn)){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('expanded');}});});
  });
}

// ─── COVER ───────────────────────────────────────────────
function renderCover(){
  const $=(id,v)=>{const el=document.getElementById(id);if(el)el.innerHTML=v;};
  const mn=DB.museum.museumName||{}, md=DB.museum.museumDesc||{};
  $('cv-logo-name',tl(mn)); $('cv-title',tl(mn));
  $('cv-title-en',gs(mn,'en')||'MUSIC MUSEUM'); $('cv-desc',tl(md));
  $('cv-eyebrow',t('prog_index')); $('notice-title',t('notice_title'));
  const nd=document.getElementById('notice-desc');if(nd)nd.innerHTML=t('notice_desc');
  document.getElementById('coverIndexGrid').innerHTML=(DB.series||[]).map(s=>{
    const totalV=(s.venues||[]).length;
    const counts=(s.venues||[]).map(venueCounts);
    const allKnown=counts.every(c=>c.known);
    const totalT=counts.reduce((n,c)=>n+c.total,0);
    return`<div class="cover-series-card" onclick="renderSeriesView('${s.id}')">
      <span class="card-series-emoji">${s.emoji||'🎵'}</span>
      <div class="card-series-tag">${tl(s.tag)||''}</div>
      <div class="card-series-name">${tl(s.name)}</div>
      <div class="card-series-meta"><span class="card-series-count">${totalV} ${t('venues_count')} · ${allKnown?totalT:'…'} ${t('tracks_count')}</span><div class="card-series-arrow">→</div></div>
    </div>`;
  }).join('');
}

// ─── SERIES VIEW ─────────────────────────────────────────
window.renderSeriesView=function(sid){
  currentSeriesId=sid; currentVenueId=null;
  switchView('view-series');
  const s=DB.series.find(s=>s.id===sid);if(!s)return;
  document.getElementById('seriesBreadcrumb').innerHTML=
    `<span class="bc-item" onclick="switchMainView('view-cover')">${tl(DB.museum.museumName)}</span><span class="bc-sep">›</span><span class="bc-current">${tl(s.name)}</span>`;
  document.getElementById('venueTabs').innerHTML=(s.venues||[]).map(v=>
    `<button class="venue-tab" onclick="renderProgramView('${sid}','${v.id}')">${tl(v.name)}</button>`).join('');
  document.getElementById('seriesHero').innerHTML=
    `<span class="series-emoji-big">${s.emoji||'🎵'}</span>
     <div class="series-hero-title">${tl(s.name)}</div>
     <div class="series-hero-en">${gs(s.name,'en')}</div>
     <div class="series-hero-desc">${tl(s.desc)||''}</div>`;
  document.getElementById('venuesGrid').innerHTML=(s.venues||[]).map(v=>{
    const counts=venueCounts(v);
    return`<div class="venue-card" onclick="renderProgramView('${sid}','${v.id}')">
      <div class="venue-card-name">${tl(v.name)}</div>
      <div class="venue-card-meta">
        <div class="venue-meta-row"><span class="venue-meta-icon">📅</span><span class="venue-meta-date">${fmtDate(v.date)}${v.time?' &nbsp;·&nbsp; '+v.time:''}</span></div>
        ${tl(v.venue)?`<div class="venue-meta-row"><span class="venue-meta-icon">📍</span><span class="venue-meta-place">${tl(v.venue)}</span></div>`:''}
      </div>
      <div class="venue-card-footer"><span class="venue-card-tracks">${trackCountText(counts)}</span><div class="venue-card-go">→</div></div>
    </div>`;
  }).join('');
  const sl=document.getElementById('sv-idx-label');if(sl)sl.textContent=t('venue_index');
};

// ─── PROGRAM VIEW (lazy-loads setlist) ───────────────────
window.renderProgramView=async function(sid,vid){
  currentSeriesId=sid; currentVenueId=vid;
  switchView('view-program');
  const s=DB.series.find(s=>s.id===sid);
  const v=s&&(s.venues||[]).find(v=>v.id===vid);if(!v)return;

  // Render header immediately (no network needed)
  document.getElementById('programBreadcrumb').innerHTML=
    `<span class="bc-item" onclick="switchMainView('view-cover')">${tl(DB.museum.museumName)}</span>
     <span class="bc-sep">›</span><span class="bc-item" onclick="renderSeriesView('${sid}')">${tl(s.name)}</span>
     <span class="bc-sep">›</span><span class="bc-current">${tl(v.name)}</span>`;
  document.getElementById('programVenueTabs').innerHTML=(s.venues||[]).map(vv=>
    `<button class="venue-tab ${vv.id===vid?'active':''}" onclick="renderProgramView('${sid}','${vv.id}')">${tl(vv.name)}</button>`).join('');
  document.getElementById('devBadge').innerHTML=badgePill(effBadge(v));
  document.getElementById('devName').innerHTML=tl(v.concertName||v.name);
  document.getElementById('devMeta').innerHTML=
    `<div class="meta-chip"><strong>${fmtDate(v.date)}</strong></div>
     ${v.time?`<div class="meta-chip">${v.time}</div>`:''}
     ${tl(v.venue)?`<div class="meta-chip">${tl(v.venue)}</div>`:''}`;
  const note=venueNote(v);
  document.getElementById('devNote').innerHTML=note?`<span>${t('venue_note')}</span>${note}`:'';
  document.getElementById('lbl-tracks').textContent=t('tracks_main');
  document.getElementById('lbl-encore').textContent=t('encore');

  // Show spinner while setlist loads
  showVenueLoader(true);

  // Load setlist (cached if available, otherwise fetch)
  const sl = await loadSetlist(vid);
  if(currentSeriesId!==sid||currentVenueId!==vid)return;
  syncTracksFromSetlist(sl.tracks, sl.encore);
  buildLookups(); markRelationsDirty();

  // Platform legend
  const allLinks=[...(sl.tracks||[]),...(sl.encore||[])].flatMap(tk=>{
    return trackLinks(tk);
  });
  const plats=[...new Set(allLinks.map(l=>l.platform))];
  const pic={qq:'🎶',netease:'☁️',spotify:'S'},pcl={qq:'sb-qq',netease:'sb-netease',spotify:'sb-spotify'};
  document.getElementById('platformLegend').innerHTML=plats.length
    ?`<span class="legend-title">${t('listen_on')}</span><div class="legend-items">${plats.map(p=>`<span class="legend-item"><span class="legend-icon ${pcl[p]||''}">${pic[p]||'🔗'}</span>${tl(PLATFORMS[p])||p}</span>`).join('')}</div>`:'';

  document.getElementById('trackscount').textContent=`${(sl.tracks||[]).length} ${t('tracks_count')}`;
  document.getElementById('gridTracks').innerHTML=renderTrackCards(sl.tracks||[],1);
  document.getElementById('gridEncore').innerHTML=renderTrackCards(sl.encore||[],1,true);
  document.getElementById('header-encore').style.display=(sl.encore||[]).length?'':'none';
};

// ─── TRACK CARDS ─────────────────────────────────────────
function renderTrackCards(tracks,startIdx){
  return tracks.map((tk,i)=>{
    const genre=tk.genre||'原创',genreCls=GENRE_CSS[genre]||'g-original',isBGM=genre==='BGM';
    const titleHtml=csv(tk.titleCn||'').map(cn=>{
      const ti=getTrack(cn);
      const disp=displayTrackName(cn);
      return ti?`<span class="track-name track-name-link" onclick="goToTrackLib('${esc(cn)}')">${disp}</span>`
               :`<span class="track-name">${disp}</span>`;
    }).join('<span style="color:var(--text-muted);padding:0 2px;">,</span>');
    const perfDisp=tk.performer?resolveNames(tk.performer,true):'';
    const origItems=originalCreditItems(tk);
    const links=streamLinks(trackLinks(tk));
    const pvTag=tk.isPV?`<span class="genre-tag" style="background:rgba(180,120,220,0.14);color:#c07ef0;border:1px solid rgba(180,120,220,0.3);">${t('pv_tag')}</span>`:'';
    const credits=[
      perfDisp?`<span class="credit-item"><span class="lbl">${t('performer')}</span>${perfDisp}</span>`:'',
      ...origItems.map(item=>`<span class="credit-item"><span class="lbl">${item.label}</span>${resolveField(item.field,true)}</span>`),
    ].filter(Boolean).join('');
    return`<div class="track-card">
      <div class="track-num-circle">${isBGM?'♪':(startIdx+i)}</div>
      <div class="track-info">
        <div class="track-title-row" style="flex-wrap:wrap;gap:6px 8px;">${titleHtml}<span class="genre-tag ${genreCls}">${gl(genre)}</span>${pvTag}</div>
        ${credits?`<div class="track-credits-row">${credits}</div>`:''}
      </div>
      <div class="stream-btns-row">${links}</div>
    </div>`;
  }).join('');
}

// ─── TRACK LIBRARY ───────────────────────────────────────
window.setTrackLibFilter=function(f,btn){
  trackLibFilter=f;document.querySelectorAll('.filter-tab').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');renderPublicTrackLib();
};
window.renderPublicTrackLib=function(){
  const rel=ensureRelationIndex();
  const q=(document.getElementById('pub-lib-search')?.value||'').toLowerCase();
  let tracks=DB.tracks.slice();
  if(trackLibFilter==='original')tracks=tracks.filter(ti=>ti.genre==='原创');
  if(q)tracks=tracks.filter(ti=>(ti.zh_cn||'').toLowerCase().includes(q)||(ti.zh_tw||'').toLowerCase().includes(q)||(ti.en||'').toLowerCase().includes(q));
  const el=document.getElementById('pub-lib-container');
  if(!tracks.length){el.innerHTML=`<div style="text-align:center;padding:40px;color:var(--text-muted);">${t('no_data')}</div>`;return;}
  el.innerHTML=tracks.map(ti=>{
    const found=rel.track[ti.zh_cn]||{app:[],bgm:[]};
    const app=found.app,bgm=found.bgm;
    const total=app.length+bgm.length;
    const voc=resolveField(ti.vocalist,true),comp=resolveField(ti.composer,true);
    const lyr=resolveField(ti.lyricist,true),arr=resolveField(ti.arranger,true);
    return`<div class="lib-card" id="libcard-${esc(ti.zh_cn)}" data-title-cn="${esc(ti.zh_cn)}">
      <div class="lib-card-header" onclick="this.closest('.lib-card').classList.toggle('expanded')">
        <div>
          <div class="lib-card-title">
            ${tl({zh_cn:ti.zh_cn,zh_tw:ti.zh_tw,en:ti.en})}
            <span class="genre-tag ${GENRE_CSS[ti.genre||'']||'g-original'}">${gl(ti.genre||'')}</span>
          </div>
          <div class="lib-card-meta">
            ${voc?`<span>${t('tk_singer')}: ${voc}</span>`:''}
            ${comp?`<span>${t('tk_composer')}: ${comp}</span>`:''}
            ${total?`<span style="color:var(--ember);font-weight:700;">${total} ${t('n_venues')}</span>`:''}
          </div>
        </div>
        <div style="color:var(--ember);font-size:20px;">⌄</div>
      </div>
      <div class="lib-card-body">
        ${lyr?`<div style="font-size:12px;color:var(--text-dim);margin-bottom:6px;">${t('tk_lyricist')}: ${lyr}</div>`:''}
        ${arr?`<div style="font-size:12px;color:var(--text-dim);margin-bottom:6px;">${t('tk_arranger')}: ${arr}</div>`:''}
        ${ti.album&&gs(ti.album,'zh_cn')?`<div style="font-size:12px;color:var(--text-dim);margin-bottom:6px;">${t('tk_album')}: ${tl(ti.album)}</div>`:''}
        ${ti.intro&&gs(ti.intro,'zh_cn')?`<div style="font-size:12px;color:var(--text-dim);margin-bottom:12px;">${t('tk_intro')}: ${tl(ti.intro)}</div>`:''}
        ${app.length?`
          <div class="artist-section-title">${t('appears_in')}</div>
          <div class="lib-venue-list">
            ${app.map(a=>`<div class="lib-venue-item" onclick="renderProgramView('${a.sid}','${a.vid}')" style="cursor:pointer;">
              <span>${tl(a.sName)} · ${tl(a.vName)}</span><span>${fmtDate(a.date)}</span>
            </div>`).join('')}
          </div>`:''}
        ${bgm.length?`
          <div class="artist-section-title">${t('appears_bgm')}</div>
          <div class="lib-venue-list">
            ${bgm.map(a=>`<div class="lib-venue-item" onclick="renderProgramView('${a.sid}','${a.vid}')" style="cursor:pointer;">
              <span>${tl(a.sName)} · ${tl(a.vName)}</span><span>${fmtDate(a.date)}</span>
            </div>`).join('')}
          </div>`:''}
        ${(ti.links||[]).length?`<div style="display:flex;gap:8px;margin-top:8px;">${streamLinks(ti.links)}</div>`:''}
      </div>
    </div>`;
  }).join('');
};;

// ─── ARTIST LIBRARY ──────────────────────────────────────
window.renderPublicArtistLib=function(){
  const rel=ensureRelationIndex();
  const q=(document.getElementById('pub-art-search')?.value||'').toLowerCase();
  let artists=DB.artists.slice();
  if(q)artists=artists.filter(a=>(a.zh_cn||'').toLowerCase().includes(q)||(a.zh_tw||'').toLowerCase().includes(q)||(a.en||'').toLowerCase().includes(q));
  const el=document.getElementById('pub-art-container');
  el.innerHTML=artists.map(a=>{
    const perfV=rel.artist[a.zh_cn]||[];
    const works=worksByArtist[a.zh_cn]||{all:[],vocalist:[],lyricist:[],composer:[],arranger:[]};
    const hasP=perfV.length>0, hasW=works.all.length>0;
    const sid=safeId(a.zh_cn);
    const dn=currentLang==='en'?(a.en||a.zh_cn):currentLang==='zh_tw'?(a.zh_tw||a.zh_cn):a.zh_cn;
    const intro=gs(a.intro,currentLang)||gs(a.intro,'zh_cn')||'';
    const alias=tl(a.aliases||{});
    const mkW=wks=>wks.map(ti=>`<span class="artist-tag" onclick="goToTrackLib('${esc(ti.zh_cn)}')" style="cursor:pointer;">${tl({zh_cn:ti.zh_cn,zh_tw:ti.zh_tw,en:ti.en})} <span style="color:var(--text-muted);font-size:10px;">${gl(ti.genre||'')}</span></span>`).join('');
    const tabs=hasW?`
      <div id="awt-${sid}" style="display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:14px;">
        <button class="modal-tab active" onclick="artTab('${sid}','all')">${t('all_tab')}</button>
        ${works.vocalist.length?`<button class="modal-tab" onclick="artTab('${sid}','vocalist')">${t('tk_singer')}</button>`:''}
        ${works.lyricist.length?`<button class="modal-tab" onclick="artTab('${sid}','lyricist')">${t('tk_lyricist')}</button>`:''}
        ${works.composer.length?`<button class="modal-tab" onclick="artTab('${sid}','composer')">${t('tk_composer')}</button>`:''}
        ${works.arranger.length?`<button class="modal-tab" onclick="artTab('${sid}','arranger')">${t('tk_arranger')}</button>`:''}
      </div>
      ${['all','vocalist','lyricist','composer','arranger'].map(r=>`<div id="awp-${sid}-${r}" class="artist-works-panel" ${r!=='all'?'style="display:none;"':''}><div class="artist-tag-list">${mkW(works[r])}</div></div>`).join('')}`:'';
    const stat=[hasP?`${perfV.length} ${t('n_venues')}`:'',hasW?`${works.all.length} ${t('n_works')}`:''].filter(Boolean).join(' · ');
    return`<div class="artist-card" id="artist-card-${sid}">
      <div class="artist-card-header" onclick="this.closest('.artist-card').classList.toggle('expanded')">
        <div>
          <div class="artist-name">${dn}</div>
          ${alias&&alias!=='—'?`<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${t('alias')}: ${alias}</div>`:''}
        </div>
        <div style="color:var(--ember);font-size:12px;font-weight:700;">${stat}</div>
      </div>
      <div class="artist-body">
        ${intro?`<div class="artist-intro">${intro}</div>`:''}
        ${hasP?`
          <div class="artist-section-title">${t('performed_in')}</div>
          <div class="lib-venue-list">
            ${perfV.map(v=>`<div class="lib-venue-item" onclick="renderProgramView('${v.sid}','${v.vid}')" style="cursor:pointer;">
              <span>${tl(v.sName)} · ${tl(v.vName)}</span>
              <span>${fmtDate(v.date)}</span>
            </div>`).join('')}
          </div>`:''}
        ${hasW?`<div class="artist-section-title">${t('rel_works')}</div>${tabs}`:''}
      </div>
    </div>`;
  }).join('');
};;
window.artTab=function(sid,role){
  const bar=document.getElementById('awt-'+sid);
  if(bar)bar.querySelectorAll('.modal-tab').forEach(b=>b.classList.toggle('active',b.getAttribute('onclick').includes("'"+role+"'")));
  ['all','vocalist','lyricist','composer','arranger'].forEach(r=>{const p=document.getElementById('awp-'+sid+'-'+r);if(p)p.style.display=r===role?'':'none';});
};

// ─── BOOT ────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded',async()=>{
  const ok=await loadStaticData();
  if(!ok)return;
  updateNavTitles();
  updateStaticUI();
  renderCover();
  // Preload all setlists in background for accurate library stats
  setTimeout(preloadAllSetlists, 1500);
});

async function preloadAllSetlists(){
  const vids=DB.series.flatMap(s=>(s.venues||[]).map(v=>v.id));
  for(const vid of vids){
    if(!setlistCache[vid]){
      await loadSetlist(vid);
      const sl=setlistCache[vid];
      if(sl)syncTracksFromSetlist(sl.tracks,sl.encore);
      await new Promise(r=>setTimeout(r,30));
    }
  }
  buildLookups();markRelationsDirty();
  // Refresh once with full counts and relationship indexes after background loading.
  const active=document.querySelector('.view.active');
  if(active)rerenderActive();
}
