import { useState, useEffect, useRef, useCallback } from "react";
import { db, ref, onValue, set, get } from "./firebase.js";

// ─── SABIT VERİ ───────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASS  = "Admin123..!!";

const INIT_USERS = [
  { id: 1, email: ADMIN_EMAIL, password: ADMIN_PASS, username: "Admin", isAdmin: true, createdAt: "2024-01-01" }
];

const INIT_MODS = [
  {
    id: 1,
    name: "RealCars Mod", nametr: "Gerçek Arabalar Modu",
    description: "Hundreds of real-world cars with accurate engine specs and realistic physics.",
    descriptiontr: "Yüzlerce gerçek dünya arabasını doğru motor özellikleri ve gerçekçi fizikle oyuna ekler.",
    version: "1.0.0", mcVersion: "1.20.1", forge: "47.4.10",
    category: "Vehicles", categorytr: "Araçlar",
    downloads: 0, size: "4.2 MB", uploadDate: "2024-06-01",
    fileData: null, fileName: null, featured: true
  }
];

// ─── ÇEVIRILER ────────────────────────────────────────────────────────────────
const T = {
  en: {
    siteName:"ModVault", tagline:"Your Minecraft Mod Library",
    home:"Home", mods:"Mods", login:"Login", register:"Register",
    logout:"Logout", admin:"Admin Panel", download:"Download", downloads:"downloads",
    search:"Search mods...", featured:"Featured", latestMods:"Latest Mods", noMods:"No mods found.",
    version:"Version", mcVersion:"MC Version", forge:"Forge", size:"Size", uploaded:"Uploaded",
    email:"Email", password:"Password", username:"Username",
    loginBtn:"Sign In", registerBtn:"Create Account",
    noAccount:"Don't have an account?", hasAccount:"Already have an account?",
    wrongCredentials:"Invalid email or password.", emailTaken:"This email is already registered.",
    loginSuccess:"Welcome back!", registerSuccess:"Account created!",
    adminTitle:"Admin Panel", uploadTab:"Upload Mod", manageTab:"Manage Mods",
    modName:"Mod Name (EN)", modNameTR:"Mod Name (TR)",
    modDesc:"Description (EN)", modDescTR:"Description (TR)",
    modVersion:"Mod Version", modMcVersion:"Minecraft Version", modForge:"Forge Version",
    modCategory:"Category (EN)", modCategoryTR:"Category (TR)",
    modSize:"File Size (e.g. 4.2 MB)", modFile:"Mod File (.jar / .zip)",
    modFeatured:"Mark as featured", uploadBtn:"Upload Mod",
    uploadSuccess:"Mod uploaded!", uploadNoFile:"Please fill in name and version.",
    deleteBtn:"Delete", editBtn:"Edit", saveBtn:"Save", cancelBtn:"Cancel",
    confirmDelete:"Delete this mod?",
    totalMods:"Total Mods", totalDownloads:"Total Downloads", totalUsers:"Total Users",
    adminOnly:"Only admin can access this panel.",
    downloading:"Downloading...", downloadDone:"Download started!",
    noFileAdmin:"No file attached — contact admin.",
    categories:["All","Vehicles","Technology","Magic","Adventure","Utility","Weapons","Nature"],
    catKeys:["all","vehicles","technology","magic","adventure","utility","weapons","nature"],
  },
  tr: {
    siteName:"ModVault", tagline:"Minecraft Mod Kütüphaneniz",
    home:"Ana Sayfa", mods:"Modlar", login:"Giriş Yap", register:"Kayıt Ol",
    logout:"Çıkış Yap", admin:"Admin Paneli", download:"İndir", downloads:"indirme",
    search:"Mod ara...", featured:"Öne Çıkan", latestMods:"Son Modlar", noMods:"Mod bulunamadı.",
    version:"Sürüm", mcVersion:"MC Sürümü", forge:"Forge", size:"Boyut", uploaded:"Yüklendi",
    email:"E-posta", password:"Şifre", username:"Kullanıcı Adı",
    loginBtn:"Giriş Yap", registerBtn:"Hesap Oluştur",
    noAccount:"Hesabın yok mu?", hasAccount:"Zaten hesabın var mı?",
    wrongCredentials:"Geçersiz e-posta veya şifre.", emailTaken:"Bu e-posta zaten kayıtlı.",
    loginSuccess:"Tekrar hoş geldin!", registerSuccess:"Hesap oluşturuldu!",
    adminTitle:"Admin Paneli", uploadTab:"Mod Yükle", manageTab:"Modları Yönet",
    modName:"Mod Adı (EN)", modNameTR:"Mod Adı (TR)",
    modDesc:"Açıklama (EN)", modDescTR:"Açıklama (TR)",
    modVersion:"Mod Sürümü", modMcVersion:"Minecraft Sürümü", modForge:"Forge Sürümü",
    modCategory:"Kategori (EN)", modCategoryTR:"Kategori (TR)",
    modSize:"Dosya Boyutu (örn. 4.2 MB)", modFile:"Mod Dosyası (.jar / .zip)",
    modFeatured:"Öne çıkan olarak işaretle", uploadBtn:"Modu Yükle",
    uploadSuccess:"Mod yüklendi!", uploadNoFile:"Lütfen ad ve sürüm girin.",
    deleteBtn:"Sil", editBtn:"Düzenle", saveBtn:"Kaydet", cancelBtn:"İptal",
    confirmDelete:"Bu modu silmek istediğinizden emin misiniz?",
    totalMods:"Toplam Mod", totalDownloads:"Toplam İndirme", totalUsers:"Toplam Kullanıcı",
    adminOnly:"Bu panele sadece admin erişebilir.",
    downloading:"İndiriliyor...", downloadDone:"İndirme başladı!",
    noFileAdmin:"Dosya eklenmemiş — adminle iletişime geç.",
    categories:["Hepsi","Araçlar","Teknoloji","Büyü","Macera","Yardımcı","Silahlar","Doğa"],
    catKeys:["all","vehicles","technology","magic","adventure","utility","weapons","nature"],
  }
};

// ─── SVG İKONLAR ──────────────────────────────────────────────────────────────
const Icon = ({ name, size=18 }) => {
  const s = { width:size, height:size, display:"block" };
  const p = { fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" };
  const map = {
    sun:   <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon:  <svg style={s} viewBox="0 0 24 24" {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    dl:    <svg style={s} viewBox="0 0 24 24" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    up:    <svg style={s} viewBox="0 0 24 24" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    trash: <svg style={s} viewBox="0 0 24 24" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg>,
    edit:  <svg style={s} viewBox="0 0 24 24" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>,
    star:  <svg style={s} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    srch:  <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    user:  <svg style={s} viewBox="0 0 24 24" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    cube:  <svg style={s} viewBox="0 0 24 24" {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    shld:  <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    chk:   <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    x:     <svg style={s} viewBox="0 0 24 24" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    globe: <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    file:  <svg style={s} viewBox="0 0 24 24" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  };
  return map[name] || null;
};

// ─── TOAST BİLDİRİMİ ─────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, []);
  const bg = { success:"#22c55e", error:"#ef4444", info:"#3b82f6", warn:"#f59e0b" };
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:9999,
      background: bg[type]||bg.info, color:"#fff",
      padding:"12px 20px", borderRadius:10, fontWeight:700,
      boxShadow:"0 4px 24px rgba(0,0,0,0.35)",
      display:"flex", alignItems:"center", gap:10,
      animation:"slideUp .3s ease", maxWidth:320, fontSize:14
    }}>
      {type==="success" && <Icon name="chk" size={15}/>}
      {type==="error"   && <Icon name="x"   size={15}/>}
      {type==="warn"    && "⚠"}
      {msg}
    </div>
  );
};

// ─── +1 ANİMASYONLU SAYAÇ ────────────────────────────────────────────────────
const AnimCount = ({ value, dark }) => {
  const [displayed, setDisplayed] = useState(value);
  const [bump, setBump] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (value !== prev.current) {
      setBump(true);
      const t = setTimeout(() => { setDisplayed(value); setBump(false); }, 400);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      transition:"color .3s",
      color: bump ? "#22c55e" : (dark ? "#94a3b8" : "#6b7280")
    }}>
      {displayed.toLocaleString()}
      {bump && (
        <span style={{
          fontSize:11, fontWeight:800, color:"#22c55e",
          animation:"countPop .4s ease forwards"
        }}>+1</span>
      )}
    </span>
  );
};

// ─── MOD KARTI ───────────────────────────────────────────────────────────────
const ModCard = ({ mod, lang, onDownload, dark, dlLoading }) => {
  const t = T[lang];
  const name = (lang==="tr" && mod.nametr) ? mod.nametr : mod.name;
  const desc = (lang==="tr" && mod.descriptiontr) ? mod.descriptiontr : mod.description;
  const cat  = (lang==="tr" && mod.categorytr) ? mod.categorytr : mod.category;
  const isLoading = dlLoading === mod.id;

  return (
    <div style={{
      background: dark?"#1e2130":"#fff",
      border:`1px solid ${dark?"#2d3347":"#e5e7eb"}`,
      borderRadius:14, overflow:"hidden",
      transition:"transform .2s, box-shadow .2s"
    }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=dark?"0 12px 32px rgba(0,0,0,.5)":"0 12px 32px rgba(0,0,0,.1)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}
    >
      {/* Kapak */}
      <div style={{
        height:130, position:"relative",
        background:dark?"linear-gradient(135deg,#1a2e1a,#1a2a3a)":"linear-gradient(135deg,#e8f5e9,#e3f2fd)",
        display:"flex", alignItems:"center", justifyContent:"center"
      }}>
        {mod.featured && (
          <div style={{
            position:"absolute", top:10, left:10,
            background:"#f59e0b", color:"#000", fontSize:11, fontWeight:800,
            padding:"3px 9px", borderRadius:20, display:"flex", alignItems:"center", gap:4
          }}>
            <Icon name="star" size={10}/> {t.featured}
          </div>
        )}
        <div style={{ opacity:.25 }}><Icon name="cube" size={52}/></div>
      </div>

      <div style={{ padding:"16px 18px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:dark?"#f1f5f9":"#1e293b" }}>{name}</h3>
          <span style={{
            background:dark?"#1a2a1a":"#dcfce7", color:dark?"#86efac":"#166534",
            fontSize:11, padding:"2px 8px", borderRadius:20, fontWeight:700, whiteSpace:"nowrap", marginLeft:8
          }}>{cat}</span>
        </div>

        <p style={{ margin:"0 0 12px", fontSize:13, color:dark?"#94a3b8":"#64748b", lineHeight:1.5,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {desc}
        </p>

        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 14px", marginBottom:12, fontSize:12, color:dark?"#64748b":"#9ca3af" }}>
          <span>{t.version}: <b style={{ color:dark?"#94a3b8":"#6b7280" }}>{mod.version}</b></span>
          <span>{t.mcVersion}: <b style={{ color:dark?"#94a3b8":"#6b7280" }}>{mod.mcVersion}</b></span>
          <span>{t.size}: <b style={{ color:dark?"#94a3b8":"#6b7280" }}>{mod.size}</b></span>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, color:dark?"#64748b":"#9ca3af", display:"flex", alignItems:"center", gap:4 }}>
            ⬇ <AnimCount value={mod.downloads} dark={dark}/> {t.downloads}
          </span>
          <button
            onClick={() => onDownload(mod)}
            disabled={isLoading}
            style={{
              background: isLoading ? "#4b5563" : "linear-gradient(135deg,#22c55e,#16a34a)",
              color:"#fff", border:"none", borderRadius:8,
              padding:"8px 16px", fontWeight:700, fontSize:13,
              cursor: isLoading?"not-allowed":"pointer",
              display:"flex", alignItems:"center", gap:6,
              transition:"opacity .2s, transform .1s",
              opacity: isLoading ? .7 : 1
            }}
            onMouseEnter={e=>{ if(!isLoading) e.currentTarget.style.opacity=".85"; }}
            onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; }}
          >
            {isLoading
              ? <><span style={{ display:"inline-block", width:13, height:13, border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .6s linear infinite" }}/> {t.downloading}</>
              : <><Icon name="dl" size={14}/> {t.download}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── LOCALSTORAGE YARDIMCILARI ────────────────────────────────────────────────
const loadLS = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const saveLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ─── ANA UYGULAMA ─────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]           = useState(() => loadLS("mpw_dark", true));
  const [lang, setLang]           = useState(() => loadLS("mpw_lang", "tr"));
  const [page, setPage]           = useState("home");
  const [authMode, setAuthMode]   = useState("login");
  const [adminTab, setAdminTab]   = useState("upload");
  const [users, setUsers]         = useState(() => loadLS("mpw_users", INIT_USERS));
  const [mods, setMods]           = useState(() => loadLS("mpw_mods", INIT_MODS));
  const [currentUser, setCurrentUser] = useState(() => loadLS("mpw_session", null));
  const [toast, setToast]         = useState(null);
  const [searchQ, setSearchQ]     = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [editingMod, setEditingMod] = useState(null);
  const [dlLoading, setDlLoading] = useState(null); // mod id

  // Auth
  const [authEmail, setAuthEmail] = useState("");
  const [authPass,  setAuthPass]  = useState("");
  const [authUser,  setAuthUser]  = useState("");
  const [authErr,   setAuthErr]   = useState("");

  // Upload form
  const emptyForm = { name:"", nametr:"", description:"", descriptiontr:"", version:"1.0.0", mcVersion:"1.20.1", forge:"47.4.10", category:"Vehicles", categorytr:"Araçlar", size:"", featured:false, fileData:null, fileName:null };
  const [uploadForm, setUploadForm] = useState(emptyForm);
  const fileRef = useRef(null);

  // localStorage'a kaydet
  useEffect(() => saveLS("mpw_dark", dark), [dark]);
  useEffect(() => saveLS("mpw_lang", lang), [lang]);
  useEffect(() => saveLS("mpw_users", users), [users]);
  useEffect(() => saveLS("mpw_mods", mods), [mods]);
  useEffect(() => saveLS("mpw_session", currentUser), [currentUser]);

  // Firebase: indirme sayaçlarını gerçek zamanlı dinle
  useEffect(() => {
    const dlRef = ref(db, "downloads");
    const unsub = onValue(dlRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      setMods(prev => prev.map(m => ({
        ...m,
        downloads: data[String(m.id)] !== undefined ? data[String(m.id)] : m.downloads
      })));
    });
    return () => unsub();
  }, []);

  const t    = T[lang];
  const D    = dark;
  const bg   = D?"#0f1117":"#f8fafc";
  const surf = D?"#161b27":"#ffffff";
  const bdr  = D?"#1e2538":"#e5e7eb";
  const txt  = D?"#e2e8f0":"#1e293b";
  const mute = D?"#64748b":"#9ca3af";
  const acc  = "#22c55e";

  const toast$ = (msg, type="success") => setToast({ msg, type });

  // ── İndirme (gerçek) ───────────────────────────────────────────────────────
  const handleDownload = useCallback((mod) => {
    if (dlLoading) return;
    setDlLoading(mod.id);

    setTimeout(async () => {
      // Firebase'de sayacı artır (gerçek zamanlı senkronizasyon)
      try {
        const dlRef = ref(db, "downloads/" + String(mod.id));
        const snap = await get(dlRef);
        const current = snap.val() || mod.downloads;
        await set(dlRef, current + 1);
      } catch(e) {
        // Firebase çalışmazsa local artır
        setMods(prev => prev.map(m => m.id === mod.id ? { ...m, downloads: m.downloads + 1 } : m));
      }

      if (mod.fileData) {
        // Admin gerçek dosya yüklediyse: blob oluştur ve indir
        try {
          const byteStr = atob(mod.fileData);
          const arr = new Uint8Array(byteStr.length);
          for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
          const blob = new Blob([arr], { type: "application/octet-stream" });
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement("a");
          a.href     = url;
          a.download = mod.fileName || `${mod.name}.jar`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast$(t.downloadDone, "success");
        } catch {
          toast$("İndirme hatası!", "error");
        }
      } else {
        toast$(t.noFileAdmin, "warn");
      }

      setDlLoading(null);
    }, 900); // küçük gecikme = loading efekti
  }, [dlLoading, t]);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const handleAuth = () => {
    setAuthErr("");
    if (authMode === "login") {
      const u = users.find(x => x.email === authEmail && x.password === authPass);
      if (!u) { setAuthErr(t.wrongCredentials); return; }
      setCurrentUser(u);
      toast$(t.loginSuccess);
      setPage("home");
    } else {
      if (users.find(x => x.email === authEmail)) { setAuthErr(t.emailTaken); return; }
      const nu = { id: Date.now(), email:authEmail, password:authPass, username:authUser, isAdmin:false, createdAt: new Date().toISOString().slice(0,10) };
      setUsers(p => [...p, nu]);
      setCurrentUser(nu);
      toast$(t.registerSuccess);
      setPage("home");
    }
    setAuthEmail(""); setAuthPass(""); setAuthUser("");
  };

  const handleLogout = () => { setCurrentUser(null); setPage("home"); };

  // ── Dosya okuma (base64) ────────────────────────────────────────────────────
  const readFile = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = e => res(e.target.result.split(",")[1]); // base64
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  // ── Mod yükleme ─────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!uploadForm.name || !uploadForm.version) { toast$(t.uploadNoFile, "error"); return; }
    const nm = {
      id: Date.now(),
      ...uploadForm,
      downloads: 0,
      uploadDate: new Date().toISOString().slice(0,10)
    };
    setMods(p => [nm, ...p]);
    setUploadForm(emptyForm);
    if (fileRef.current) fileRef.current.value = "";
    toast$(t.uploadSuccess);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await readFile(file);
    const sizeKB = file.size / 1024;
    const sizeStr = sizeKB > 1024 ? `${(sizeKB/1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
    setUploadForm(p => ({ ...p, fileData: data, fileName: file.name, size: sizeStr }));
  };

  // ── Mod silme / düzenleme ───────────────────────────────────────────────────
  const handleDelete = (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    setMods(p => p.filter(m => m.id !== id));
  };

  const handleSaveEdit = () => {
    setMods(p => p.map(m => m.id === editingMod.id ? editingMod : m));
    setEditingMod(null);
    toast$(t.uploadSuccess);
  };

  // ── Filtreleme ──────────────────────────────────────────────────────────────
  const filteredMods = mods.filter(m => {
    const name = ((lang==="tr"&&m.nametr)?m.nametr:m.name).toLowerCase();
    const cat  = ((lang==="tr"&&m.categorytr)?m.categorytr:m.category).toLowerCase();
    const q    = searchQ.toLowerCase();
    const matchQ   = !q || name.includes(q) || cat.includes(q);
    const matchCat = filterCat==="all" || m.category.toLowerCase()===filterCat || cat===filterCat;
    return matchQ && matchCat;
  });

  const isAdmin = currentUser?.isAdmin;

  // ── Input stili ─────────────────────────────────────────────────────────────
  const inp = {
    background: D?"#1e2538":"#f1f5f9",
    border:`1px solid ${bdr}`, borderRadius:8,
    padding:"10px 14px", color:txt, fontSize:14,
    outline:"none", width:"100%", boxSizing:"border-box"
  };

  // ── Navbar butonu ──────────────────────────────────────────────────────────
  const NavBtn = ({ id, label, icon }) => (
    <button onClick={() => setPage(id)} style={{
      background: page===id ? (D?"#1e2d1e":"#dcfce7") : "transparent",
      color: page===id ? acc : mute,
      border:"none", borderRadius:8, padding:"8px 14px",
      fontWeight:600, fontSize:14, cursor:"pointer",
      display:"flex", alignItems:"center", gap:6, transition:"all .15s"
    }}>
      {icon && <Icon name={icon} size={15}/>} {label}
    </button>
  );

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight:"100vh", background:bg, color:txt, fontFamily:"'Segoe UI',system-ui,sans-serif", transition:"background .3s, color .3s" }}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:${D?"#2d3347":"#cbd5e1"};border-radius:3px}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn {from{opacity:0}to{opacity:1}}
        @keyframes spin   {to{transform:rotate(360deg)}}
        @keyframes countPop{0%{opacity:0;transform:translateY(4px)}50%{opacity:1;transform:translateY(-6px)}100%{opacity:0;transform:translateY(-12px)}}
        input::placeholder,textarea::placeholder{color:${mute}}
        select option{background:${D?"#1e2538":"#fff"}}
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        background: D?"rgba(15,17,23,0.93)":"rgba(248,250,252,0.93)",
        backdropFilter:"blur(12px)", borderBottom:`1px solid ${bdr}`,
        padding:"0 20px", display:"flex", alignItems:"center", gap:6, height:60, flexWrap:"wrap"
      }}>
        <button onClick={()=>setPage("home")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:9, marginRight:14 }}>
          <div style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", borderRadius:8, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="cube" size={17}/>
          </div>
          <span style={{ fontWeight:900, fontSize:20, color:acc, letterSpacing:-.5 }}>{t.siteName}</span>
        </button>

        <NavBtn id="home"  label={t.home}/>
        <NavBtn id="mods"  label={t.mods} icon="cube"/>
        {isAdmin && <NavBtn id="admin" label={t.admin} icon="shld"/>}

        <div style={{ flex:1 }}/>

        {/* Dil */}
        <button onClick={()=>setLang(l=>l==="en"?"tr":"en")} style={{
          background:D?"#1e2538":"#e2e8f0", border:"none", borderRadius:8,
          padding:"7px 11px", color:txt, fontWeight:700, fontSize:13, cursor:"pointer",
          display:"flex", alignItems:"center", gap:5
        }}>
          <Icon name="globe" size={13}/> {lang==="en"?"TR":"EN"}
        </button>

        {/* Tema */}
        <button onClick={()=>setDark(d=>!d)} style={{
          background:D?"#1e2538":"#e2e8f0", border:"none", borderRadius:8,
          padding:"7px 9px", cursor:"pointer", color:txt, display:"flex", alignItems:"center"
        }}>
          <Icon name={D?"sun":"moon"} size={16}/>
        </button>

        {/* Kullanıcı */}
        {currentUser ? (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:D?"#1e2538":"#e2e8f0", borderRadius:8 }}>
              <Icon name="user" size={14}/>
              <span style={{ fontSize:13, fontWeight:600 }}>{currentUser.username}</span>
              {currentUser.isAdmin && <span style={{ fontSize:10, background:"#f59e0b", color:"#000", padding:"1px 6px", borderRadius:20, fontWeight:800 }}>ADMIN</span>}
            </div>
            <button onClick={handleLogout} style={{ background:"#ef4444", border:"none", borderRadius:8, padding:"7px 13px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              {t.logout}
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", gap:7 }}>
            <button onClick={()=>{setPage("auth");setAuthMode("login");}} style={{ background:D?"#1e2538":"#e2e8f0", border:"none", borderRadius:8, padding:"7px 13px", color:txt, fontWeight:600, fontSize:13, cursor:"pointer" }}>{t.login}</button>
            <button onClick={()=>{setPage("auth");setAuthMode("register");}} style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:8, padding:"7px 13px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>{t.register}</button>
          </div>
        )}
      </nav>

      {/* ── ANA SAYFA ────────────────────────────────────────────────────────── */}
      {page==="home" && (
        <div style={{ animation:"fadeIn .4s ease" }}>
          <div style={{
            background: D?"linear-gradient(160deg,#0f1117,#0d2012 55%,#0f1117)":"linear-gradient(160deg,#f0fdf4,#dcfce7 55%,#f0fdf4)",
            borderBottom:`1px solid ${bdr}`, padding:"76px 24px 56px", textAlign:"center"
          }}>
            <div style={{ maxWidth:660, margin:"0 auto" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:D?"#1e2d1e":"#dcfce7", border:`1px solid ${D?"#2d4a2d":"#86efac"}`, borderRadius:20, padding:"5px 15px", marginBottom:22 }}>
                <Icon name="cube" size={13}/> <span style={{ fontSize:12, fontWeight:700, color:acc }}>Minecraft Mod Hub</span>
              </div>
              <h1 style={{ fontSize:52, fontWeight:900, margin:"0 0 14px", letterSpacing:-2, lineHeight:1.05 }}>
                <span style={{ color:acc }}>Mod</span>Vault
              </h1>
              <p style={{ fontSize:17, color:mute, margin:"0 0 34px", lineHeight:1.6 }}>{t.tagline}</p>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={()=>setPage("mods")} style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:10, padding:"13px 30px", color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer" }}>
                  {t.mods} →
                </button>
                {!currentUser && (
                  <button onClick={()=>{setPage("auth");setAuthMode("register");}} style={{ background:D?"#1e2538":"#fff", border:`1px solid ${bdr}`, borderRadius:10, padding:"13px 30px", color:txt, fontWeight:700, fontSize:16, cursor:"pointer" }}>
                    {t.register}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* İstatistik kartları */}
          <div style={{ maxWidth:960, margin:"0 auto", padding:"48px 24px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18, marginBottom:44 }}>
              {[
                { label:t.totalMods,      val: mods.length,                                         icon:"cube",  col:"#22c55e" },
                { label:t.totalDownloads, val: mods.reduce((a,m)=>a+m.downloads,0).toLocaleString(), icon:"dl",    col:"#3b82f6" },
                { label:t.totalUsers,     val: users.length,                                         icon:"user",  col:"#f59e0b" },
              ].map((s,i) => (
                <div key={i} style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:14, padding:"26px 22px", textAlign:"center" }}>
                  <div style={{ color:s.col, marginBottom:8 }}><Icon name={s.icon} size={26}/></div>
                  <div style={{ fontSize:30, fontWeight:900, color:txt }}>{s.val}</div>
                  <div style={{ fontSize:13, color:mute, marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {mods.filter(m=>m.featured).length > 0 && <>
              <h2 style={{ fontSize:21, fontWeight:800, marginBottom:18 }}>⭐ {t.featured}</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:18 }}>
                {mods.filter(m=>m.featured).map(m=><ModCard key={m.id} mod={m} lang={lang} onDownload={handleDownload} dark={D} dlLoading={dlLoading}/>)}
              </div>
            </>}
          </div>
        </div>
      )}

      {/* ── MODLAR SAYFASI ───────────────────────────────────────────────────── */}
      {page==="mods" && (
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"38px 24px", animation:"fadeIn .4s ease" }}>
          <h1 style={{ fontSize:28, fontWeight:900, marginBottom:22 }}>{t.latestMods}</h1>

          <div style={{ display:"flex", gap:10, marginBottom:28, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:200, position:"relative" }}>
              <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:mute, pointerEvents:"none" }}>
                <Icon name="srch" size={15}/>
              </span>
              <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder={t.search} style={{ ...inp, paddingLeft:38 }}/>
            </div>
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ ...inp, width:"auto", minWidth:150 }}>
              {t.catKeys.map((k,i)=><option key={k} value={k}>{t.categories[i]}</option>)}
            </select>
          </div>

          {filteredMods.length===0
            ? <div style={{ textAlign:"center", padding:"80px 0", color:mute }}><Icon name="cube" size={46}/><br/><br/>{t.noMods}</div>
            : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:18 }}>
                {filteredMods.map(m=><ModCard key={m.id} mod={m} lang={lang} onDownload={handleDownload} dark={D} dlLoading={dlLoading}/>)}
              </div>
          }
        </div>
      )}

      {/* ── GİRİŞ / KAYIT SAYFASI ───────────────────────────────────────────── */}
      {page==="auth" && (
        <div style={{ minHeight:"calc(100vh - 60px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, animation:"fadeIn .4s ease" }}>
          <div style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:16, padding:"38px 34px", width:"100%", maxWidth:410, boxShadow:`0 20px 60px ${D?"rgba(0,0,0,.5)":"rgba(0,0,0,.08)"}` }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", borderRadius:12, width:50, height:50, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                <Icon name={authMode==="login"?"user":"shld"} size={22}/>
              </div>
              <h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>{authMode==="login"?t.login:t.register}</h2>
            </div>

            {/* Tab */}
            <div style={{ display:"flex", background:D?"#1e2538":"#e2e8f0", borderRadius:10, padding:4, marginBottom:24 }}>
              {["login","register"].map(m=>(
                <button key={m} onClick={()=>{setAuthMode(m);setAuthErr("");}} style={{
                  flex:1, border:"none", borderRadius:8, padding:"9px",
                  background: authMode===m?(D?"#2d3347":"#fff"):"transparent",
                  color: authMode===m?txt:mute,
                  fontWeight:700, fontSize:13, cursor:"pointer",
                  boxShadow: authMode===m?`0 2px 8px ${D?"rgba(0,0,0,.3)":"rgba(0,0,0,.1)"}`:"none",
                  transition:"all .2s"
                }}>
                  {m==="login"?t.login:t.register}
                </button>
              ))}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              {authMode==="register" && (
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{t.username}</label>
                  <input value={authUser} onChange={e=>setAuthUser(e.target.value)} placeholder={t.username} style={inp}/>
                </div>
              )}
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{t.email}</label>
                <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder={t.email} type="email" style={inp}/>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{t.password}</label>
                <input value={authPass} onChange={e=>setAuthPass(e.target.value)} placeholder={t.password} type="password" style={inp}
                  onKeyDown={e=>e.key==="Enter"&&handleAuth()}/>
              </div>

              {authErr && <div style={{ color:"#ef4444", fontSize:13, fontWeight:600, padding:"8px 12px", background:"rgba(239,68,68,.1)", borderRadius:8 }}>{authErr}</div>}

              <button onClick={handleAuth} style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:10, padding:"12px", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", marginTop:2 }}>
                {authMode==="login"?t.loginBtn:t.registerBtn}
              </button>

              <div style={{ textAlign:"center", fontSize:13, color:mute }}>
                {authMode==="login"?t.noAccount:t.hasAccount}{" "}
                <button onClick={()=>{setAuthMode(m=>m==="login"?"register":"login");setAuthErr("");}} style={{ background:"none", border:"none", color:acc, fontWeight:700, cursor:"pointer", fontSize:13 }}>
                  {authMode==="login"?t.register:t.login}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMİN PANELİ ────────────────────────────────────────────────────── */}
      {page==="admin" && (
        <div style={{ maxWidth:1000, margin:"0 auto", padding:"38px 24px", animation:"fadeIn .4s ease" }}>
          {!isAdmin ? (
            <div style={{ textAlign:"center", padding:"80px 0", color:mute }}>
              <Icon name="shld" size={46}/><br/><br/>{t.adminOnly}
            </div>
          ) : <>
            <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:30 }}>
              <div style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", borderRadius:10, padding:10 }}>
                <Icon name="shld" size={20}/>
              </div>
              <h1 style={{ margin:0, fontSize:26, fontWeight:900 }}>{t.adminTitle}</h1>
            </div>

            {/* İstatistik */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:28 }}>
              {[
                { label:t.totalMods,      val:mods.length,                              col:"#22c55e" },
                { label:t.totalDownloads, val:mods.reduce((a,m)=>a+m.downloads,0),      col:"#3b82f6" },
                { label:t.totalUsers,     val:users.length,                             col:"#f59e0b" },
              ].map((s,i)=>(
                <div key={i} style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:12, padding:"18px 20px" }}>
                  <div style={{ fontSize:26, fontWeight:900, color:s.col }}>{s.val}</div>
                  <div style={{ fontSize:13, color:mute, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Sekmeler */}
            <div style={{ display:"flex", gap:3, background:D?"#1e2538":"#e2e8f0", borderRadius:10, padding:4, marginBottom:24, width:"fit-content" }}>
              {["upload","manage"].map(tab=>(
                <button key={tab} onClick={()=>setAdminTab(tab)} style={{
                  border:"none", borderRadius:8, padding:"9px 18px",
                  background: adminTab===tab?(D?"#2d3347":"#fff"):"transparent",
                  color: adminTab===tab?txt:mute,
                  fontWeight:700, fontSize:13, cursor:"pointer",
                  transition:"all .2s", display:"flex", alignItems:"center", gap:5
                }}>
                  <Icon name={tab==="upload"?"up":"cube"} size={13}/>
                  {tab==="upload"?t.uploadTab:t.manageTab}
                </button>
              ))}
            </div>

            {/* YÜKLEME SEKMESİ */}
            {adminTab==="upload" && (
              <div style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:14, padding:"26px 26px" }}>
                <h2 style={{ margin:"0 0 22px", fontSize:17, fontWeight:700 }}>{t.uploadTab}</h2>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  {[
                    { key:"name",      label:t.modName },
                    { key:"nametr",    label:t.modNameTR },
                    { key:"version",   label:t.modVersion },
                    { key:"mcVersion", label:t.modMcVersion },
                    { key:"forge",     label:t.modForge },
                    { key:"size",      label:t.modSize },
                    { key:"category",  label:t.modCategory },
                    { key:"categorytr",label:t.modCategoryTR },
                  ].map(f=>(
                    <div key={f.key}>
                      <label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{f.label}</label>
                      <input value={uploadForm[f.key]} onChange={e=>setUploadForm(p=>({...p,[f.key]:e.target.value}))} style={inp}/>
                    </div>
                  ))}
                  <div style={{ gridColumn:"1/-1" }}>
                    <label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{t.modDesc}</label>
                    <textarea value={uploadForm.description} onChange={e=>setUploadForm(p=>({...p,description:e.target.value}))} rows={3} style={{ ...inp, resize:"vertical" }}/>
                  </div>
                  <div style={{ gridColumn:"1/-1" }}>
                    <label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{t.modDescTR}</label>
                    <textarea value={uploadForm.descriptiontr} onChange={e=>setUploadForm(p=>({...p,descriptiontr:e.target.value}))} rows={3} style={{ ...inp, resize:"vertical" }}/>
                  </div>

                  {/* Dosya seçici */}
                  <div style={{ gridColumn:"1/-1" }}>
                    <label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{t.modFile}</label>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <input ref={fileRef} type="file" accept=".jar,.zip" onChange={handleFileSelect} style={{ display:"none" }}/>
                      <button onClick={()=>fileRef.current?.click()} style={{ background:D?"#1e2538":"#e2e8f0", border:`1px solid ${bdr}`, borderRadius:8, padding:"10px 16px", color:txt, fontWeight:600, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}>
                        <Icon name="file" size={14}/> Dosya Seç
                      </button>
                      {uploadForm.fileName && (
                        <span style={{ fontSize:13, color:acc, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
                          <Icon name="chk" size={14}/> {uploadForm.fileName} ({uploadForm.size})
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:9 }}>
                    <input type="checkbox" id="featChk" checked={uploadForm.featured} onChange={e=>setUploadForm(p=>({...p,featured:e.target.checked}))} style={{ width:17, height:17, accentColor:acc }}/>
                    <label htmlFor="featChk" style={{ fontSize:13, fontWeight:600, cursor:"pointer" }}>{t.modFeatured}</label>
                  </div>
                </div>

                <button onClick={handleUpload} style={{ marginTop:22, background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:10, padding:"11px 26px", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}>
                  <Icon name="up" size={15}/> {t.uploadBtn}
                </button>
              </div>
            )}

            {/* YÖNETİM SEKMESİ */}
            {adminTab==="manage" && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {mods.length===0 && <div style={{ textAlign:"center", padding:"60px", color:mute }}><Icon name="cube" size={40}/><br/><br/>{t.noMods}</div>}
                {mods.map(m=>(
                  editingMod?.id===m.id ? (
                    <div key={m.id} style={{ background:surf, border:`2px solid ${acc}`, borderRadius:14, padding:"20px 22px" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                        {["name","nametr","version","mcVersion","category","categorytr"].map(k=>(
                          <div key={k}>
                            <label style={{ fontSize:11, color:mute, display:"block", marginBottom:3 }}>{k}</label>
                            <input value={editingMod[k]||""} onChange={e=>setEditingMod(p=>({...p,[k]:e.target.value}))} style={inp}/>
                          </div>
                        ))}
                        <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:8 }}>
                          <input type="checkbox" id={`fe${m.id}`} checked={editingMod.featured||false} onChange={e=>setEditingMod(p=>({...p,featured:e.target.checked}))} style={{ width:15,height:15,accentColor:acc }}/>
                          <label htmlFor={`fe${m.id}`} style={{ fontSize:13, fontWeight:600, cursor:"pointer" }}>{t.modFeatured}</label>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:9 }}>
                        <button onClick={handleSaveEdit} style={{ background:acc, border:"none", borderRadius:8, padding:"8px 18px", color:"#fff", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:13 }}>
                          <Icon name="chk" size={13}/> {t.saveBtn}
                        </button>
                        <button onClick={()=>setEditingMod(null)} style={{ background:D?"#2d3347":"#e2e8f0", border:"none", borderRadius:8, padding:"8px 18px", color:txt, fontWeight:700, cursor:"pointer", fontSize:13 }}>
                          {t.cancelBtn}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14 }}>
                          {m.name}{m.nametr&&m.nametr!==m.name?` / ${m.nametr}`:""}
                          {m.fileName && <span style={{ marginLeft:8, fontSize:11, color:acc, fontWeight:600 }}>📎 {m.fileName}</span>}
                        </div>
                        <div style={{ fontSize:12, color:mute, marginTop:2 }}>
                          v{m.version} · MC {m.mcVersion} · {m.category} · ⬇ {m.downloads}
                        </div>
                      </div>
                      {m.featured && <span style={{ fontSize:11, background:"#f59e0b", color:"#000", padding:"2px 7px", borderRadius:20, fontWeight:800 }}>★</span>}
                      <button onClick={()=>setEditingMod({...m})} style={{ background:D?"#1e2538":"#e2e8f0", border:"none", borderRadius:7, padding:"7px 12px", color:txt, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:12 }}>
                        <Icon name="edit" size={13}/> {t.editBtn}
                      </button>
                      <button onClick={()=>handleDelete(m.id)} style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:7, padding:"7px 12px", color:"#ef4444", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:12 }}>
                        <Icon name="trash" size={13}/> {t.deleteBtn}
                      </button>
                    </div>
                  )
                ))}
              </div>
            )}
          </>}
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${bdr}`, padding:"24px", textAlign:"center", color:mute, fontSize:13, marginTop:60 }}>
        <span style={{ fontWeight:800, color:acc }}>ModVault</span> — Minecraft Mod Hub © {new Date().getFullYear()}
      </footer>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
}
