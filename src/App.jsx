bash

cat > /home/claude/modpackworld/src/App.jsx << 'ENDOFFILE'
import { useState, useEffect, useRef } from "react";
import { db, ref, onValue, set, push, remove, update } from "./firebase.js";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASS  = "Admin123..!!";

const T = {
  en: {
    siteName:"ModVault", tagline:"Your Minecraft Mod Library",
    home:"Home", mods:"Mods", login:"Login", register:"Register",
    logout:"Logout", admin:"Admin Panel", download:"Download", downloads:"downloads",
    search:"Search mods...", featured:"Featured", latestMods:"Latest Mods", noMods:"No mods found.",
    version:"Version", mcVersion:"MC Version", size:"Size",
    email:"Email", password:"Password", username:"Username",
    loginBtn:"Sign In", registerBtn:"Create Account",
    noAccount:"Don't have an account?", hasAccount:"Already have an account?",
    wrongCreds:"Invalid email or password.", emailTaken:"Email already registered.",
    loginOk:"Welcome back!", registerOk:"Account created!",
    adminTitle:"Admin Panel", uploadTab:"Upload Mod", manageTab:"Manage Mods",
    modName:"Mod Name (EN)", modNameTR:"Mod Name (TR)",
    modDesc:"Description (EN)", modDescTR:"Description (TR)",
    modVersion:"Mod Version", modMcVersion:"MC Version", modForge:"Forge Version",
    modCat:"Category (EN)", modCatTR:"Category (TR)",
    modSize:"File Size (e.g. 4.2 MB)", modFile:"Mod File (.jar/.zip)",
    modFeatured:"Mark as featured", uploadBtn:"Upload Mod",
    uploadOk:"Mod uploaded!", uploadErr:"Please fill name and version.",
    deleteBtn:"Delete", editBtn:"Edit", saveBtn:"Save", cancelBtn:"Cancel",
    confirmDelete:"Delete this mod?",
    totalMods:"Total Mods", totalDl:"Total Downloads", totalUsers:"Total Users",
    adminOnly:"Only admin can access this panel.",
    downloading:"Downloading...", downloadOk:"Download started!",
    noFile:"No file attached.",
    categories:["All","Vehicles","Technology","Magic","Adventure","Utility","Weapons","Nature"],
    catKeys:["all","vehicles","technology","magic","adventure","utility","weapons","nature"],
  },
  tr: {
    siteName:"ModVault", tagline:"Minecraft Mod Kütüphaneniz",
    home:"Ana Sayfa", mods:"Modlar", login:"Giriş Yap", register:"Kayıt Ol",
    logout:"Çıkış Yap", admin:"Admin Paneli", download:"İndir", downloads:"indirme",
    search:"Mod ara...", featured:"Öne Çıkan", latestMods:"Son Modlar", noMods:"Mod bulunamadı.",
    version:"Sürüm", mcVersion:"MC Sürümü", size:"Boyut",
    email:"E-posta", password:"Şifre", username:"Kullanıcı Adı",
    loginBtn:"Giriş Yap", registerBtn:"Hesap Oluştur",
    noAccount:"Hesabın yok mu?", hasAccount:"Zaten hesabın var mı?",
    wrongCreds:"Geçersiz e-posta veya şifre.", emailTaken:"Bu e-posta zaten kayıtlı.",
    loginOk:"Tekrar hoş geldin!", registerOk:"Hesap oluşturuldu!",
    adminTitle:"Admin Paneli", uploadTab:"Mod Yükle", manageTab:"Modları Yönet",
    modName:"Mod Adı (EN)", modNameTR:"Mod Adı (TR)",
    modDesc:"Açıklama (EN)", modDescTR:"Açıklama (TR)",
    modVersion:"Mod Sürümü", modMcVersion:"MC Sürümü", modForge:"Forge Sürümü",
    modCat:"Kategori (EN)", modCatTR:"Kategori (TR)",
    modSize:"Dosya Boyutu (örn. 4.2 MB)", modFile:"Mod Dosyası (.jar/.zip)",
    modFeatured:"Öne çıkan olarak işaretle", uploadBtn:"Modu Yükle",
    uploadOk:"Mod yüklendi!", uploadErr:"Lütfen ad ve sürüm girin.",
    deleteBtn:"Sil", editBtn:"Düzenle", saveBtn:"Kaydet", cancelBtn:"İptal",
    confirmDelete:"Bu modu silmek istediğinizden emin misiniz?",
    totalMods:"Toplam Mod", totalDl:"Toplam İndirme", totalUsers:"Toplam Kullanıcı",
    adminOnly:"Bu panele sadece admin erişebilir.",
    downloading:"İndiriliyor...", downloadOk:"İndirme başladı!",
    noFile:"Dosya eklenmemiş.",
    categories:["Hepsi","Araçlar","Teknoloji","Büyü","Macera","Yardımcı","Silahlar","Doğa"],
    catKeys:["all","vehicles","technology","magic","adventure","utility","weapons","nature"],
  }
};

const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

const Icon = ({ n, s=18 }) => {
  const p = { width:s, height:s, display:"block", fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    sun:  <svg {...p} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon: <svg {...p} viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    dl:   <svg {...p} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    up:   <svg {...p} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    del:  <svg {...p} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg>,
    edit: <svg {...p} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>,
    star: <svg {...p} fill="currentColor" strokeWidth="1" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    srch: <svg {...p} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    user: <svg {...p} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    cube: <svg {...p} viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    shld: <svg {...p} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    chk:  <svg {...p} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    x:    <svg {...p} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    glob: <svg {...p} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    file: <svg {...p} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  };
  return icons[n] || null;
};

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const bg = { success:"#22c55e", error:"#ef4444", warn:"#f59e0b" };
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, background:bg[type]||bg.success, color:"#fff", padding:"12px 20px", borderRadius:10, fontWeight:700, fontSize:14, boxShadow:"0 4px 24px rgba(0,0,0,.35)", display:"flex", alignItems:"center", gap:8, animation:"slideUp .3s ease", maxWidth:320 }}>
      {type==="success"&&<Icon n="chk" s={15}/>}{type==="error"&&<Icon n="x" s={15}/>} {msg}
    </div>
  );
};

const ModCard = ({ mod, lang, onDownload, dark, dlLoading }) => {
  const t = T[lang];
  const name = (lang==="tr"&&mod.nametr) ? mod.nametr : mod.name;
  const desc = (lang==="tr"&&mod.desctr) ? mod.desctr : mod.desc;
  const cat  = (lang==="tr"&&mod.cattr) ? mod.cattr : mod.cat;
  const loading = dlLoading === mod.id;
  return (
    <div style={{ background:dark?"#1e2130":"#fff", border:`1px solid ${dark?"#2d3347":"#e5e7eb"}`, borderRadius:14, overflow:"hidden", transition:"transform .2s,box-shadow .2s" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=dark?"0 12px 32px rgba(0,0,0,.5)":"0 12px 32px rgba(0,0,0,.1)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
      <div style={{ height:130, background:dark?"linear-gradient(135deg,#1a2e1a,#1a2a3a)":"linear-gradient(135deg,#e8f5e9,#e3f2fd)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
        {mod.featured&&<div style={{ position:"absolute", top:10, left:10, background:"#f59e0b", color:"#000", fontSize:11, fontWeight:800, padding:"3px 9px", borderRadius:20, display:"flex", alignItems:"center", gap:4 }}><Icon n="star" s={10}/> {t.featured}</div>}
        <div style={{ opacity:.25 }}><Icon n="cube" s={52}/></div>
      </div>
      <div style={{ padding:"16px 18px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:dark?"#f1f5f9":"#1e293b" }}>{name}</h3>
          <span style={{ background:dark?"#1a2a1a":"#dcfce7", color:dark?"#86efac":"#166534", fontSize:11, padding:"2px 8px", borderRadius:20, fontWeight:700, whiteSpace:"nowrap", marginLeft:8 }}>{cat}</span>
        </div>
        <p style={{ margin:"0 0 12px", fontSize:13, color:dark?"#94a3b8":"#64748b", lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{desc}</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 14px", marginBottom:12, fontSize:12, color:dark?"#64748b":"#9ca3af" }}>
          <span>{t.version}: <b style={{ color:dark?"#94a3b8":"#6b7280" }}>{mod.version}</b></span>
          <span>{t.mcVersion}: <b style={{ color:dark?"#94a3b8":"#6b7280" }}>{mod.mcVersion}</b></span>
          <span>{t.size}: <b style={{ color:dark?"#94a3b8":"#6b7280" }}>{mod.size}</b></span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, color:dark?"#64748b":"#9ca3af" }}>⬇ {(mod.downloads||0).toLocaleString()} {t.downloads}</span>
          <button onClick={()=>onDownload(mod)} disabled={loading} style={{ background:loading?"#4b5563":"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontWeight:700, fontSize:13, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:6, opacity:loading?.7:1, transition:"opacity .2s" }}>
            {loading ? <><span style={{ width:13, height:13, border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .6s linear infinite", display:"inline-block" }}/> {t.downloading}</> : <><Icon n="dl" s={14}/> {t.download}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const EMPTY_FORM = { name:"", nametr:"", desc:"", desctr:"", version:"1.0.0", mcVersion:"1.20.1", forge:"47.4.10", cat:"Vehicles", cattr:"Araçlar", size:"", featured:false, fileData:null, fileName:null };

export default function App() {
  const [dark, setDark]     = useState(()=>LS.get("mpw_dark", true));
  const [lang, setLang]     = useState(()=>LS.get("mpw_lang", "tr"));
  const [page, setPage]     = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [adminTab, setAdminTab] = useState("upload");
  const [session, setSession]   = useState(()=>LS.get("mpw_session", null));
  const [users, setUsers]   = useState(()=>LS.get("mpw_users", [{ id:"admin", email:ADMIN_EMAIL, password:ADMIN_PASS, username:"Admin", isAdmin:true }]));
  const [mods, setMods]     = useState([]);
  const [toast, setToast]   = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [dlLoading, setDlLoading] = useState(null);
  const [editMod, setEditMod]     = useState(null);
  const [form, setForm]     = useState(EMPTY_FORM);
  const fileRef = useRef(null);

  const t = T[lang];
  const D = dark;
  const bg   = D?"#0f1117":"#f8fafc";
  const surf = D?"#161b27":"#fff";
  const bdr  = D?"#1e2538":"#e5e7eb";
  const txt  = D?"#e2e8f0":"#1e293b";
  const mute = D?"#64748b":"#9ca3af";
  const acc  = "#22c55e";

  const toast$ = (msg, type="success") => setToast({ msg, type });
  const inp = { background:D?"#1e2538":"#f1f5f9", border:`1px solid ${bdr}`, borderRadius:8, padding:"10px 14px", color:txt, fontSize:14, outline:"none", width:"100%", boxSizing:"border-box" };

  // Persist
  useEffect(()=>LS.set("mpw_dark", dark),[dark]);
  useEffect(()=>LS.set("mpw_lang", lang),[lang]);
  useEffect(()=>LS.set("mpw_session", session),[session]);
  useEffect(()=>LS.set("mpw_users", users),[users]);

  // Firebase: modları gerçek zamanlı dinle
  useEffect(()=>{
    const modsRef = ref(db, "mods");
    const unsub = onValue(modsRef, snap => {
      const data = snap.val();
      if (!data) { setMods([]); return; }
      const list = Object.entries(data).map(([id, v]) => ({ ...v, id }));
      setMods(list.sort((a,b) => (b.uploadDate||"").localeCompare(a.uploadDate||"")));
    });
    return () => unsub();
  },[]);

  // Auth
  const handleAuth = () => {
    if (authMode==="login") {
      const u = users.find(x => x.email===authMode && x.password===form.password);
      const u2 = users.find(x => x.email===form.email && x.password===form.password);
      if (!u2) { toast$(t.wrongCreds,"error"); return; }
      setSession(u2); toast$(t.loginOk); setPage("home");
    } else {
      if (users.find(x=>x.email===form.email)) { toast$(t.emailTaken,"error"); return; }
      const nu = { id: Date.now().toString(), email:form.email, password:form.password, username:form.username, isAdmin:false };
      setUsers(p=>[...p, nu]); setSession(nu); toast$(t.registerOk); setPage("home");
    }
    setForm(EMPTY_FORM);
  };

  const handleLogout = () => { setSession(null); setPage("home"); };

  // İndirme
  const handleDownload = async (mod) => {
    if (dlLoading) return;
    setDlLoading(mod.id);
    try {
      const newDl = (mod.downloads||0) + 1;
      await update(ref(db, `mods/${mod.id}`), { downloads: newDl });
      if (mod.fileData) {
        const bytes = atob(mod.fileData);
        const arr = new Uint8Array(bytes.length);
        for (let i=0;i<bytes.length;i++) arr[i]=bytes.charCodeAt(i);
        const blob = new Blob([arr], { type:"application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href=url; a.download=mod.fileName||`${mod.name}.jar`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        toast$(t.downloadOk);
      } else { toast$(t.noFile, "warn"); }
    } catch(e) { toast$("Hata!", "error"); }
    setDlLoading(null);
  };

  // Mod yükle
  const handleUpload = async () => {
    if (!form.name||!form.version) { toast$(t.uploadErr,"error"); return; }
    const nm = { ...form, downloads:0, uploadDate: new Date().toISOString().slice(0,10) };
    delete nm.id;
    await push(ref(db,"mods"), nm);
    setForm(EMPTY_FORM);
    if (fileRef.current) fileRef.current.value="";
    toast$(t.uploadOk);
  };

  // Mod sil
  const handleDelete = async (mod) => {
    if (!window.confirm(t.confirmDelete)) return;
    await remove(ref(db, `mods/${mod.id}`));
  };

  // Mod güncelle
  const handleSave = async () => {
    const { id, ...data } = editMod;
    await update(ref(db, `mods/${id}`), data);
    setEditMod(null); toast$(t.uploadOk);
  };

  // Dosya oku
  const readFile = file => new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(file); });
  const handleFile = async e => {
    const file = e.target.files[0]; if(!file) return;
    const data = await readFile(file);
    const kb = file.size/1024;
    const sz = kb>1024?`${(kb/1024).toFixed(1)} MB`:`${Math.round(kb)} KB`;
    setForm(p=>({...p, fileData:data, fileName:file.name, size:sz}));
  };

  const isAdmin = session?.isAdmin;
  const filtered = mods.filter(m=>{
    const name = ((lang==="tr"&&m.nametr)?m.nametr:m.name||"").toLowerCase();
    const cat  = ((lang==="tr"&&m.cattr)?m.cattr:m.cat||"").toLowerCase();
    const q = search.toLowerCase();
    const mQ = !q||name.includes(q)||cat.includes(q);
    const mC = filterCat==="all"||m.cat?.toLowerCase()===filterCat||cat===filterCat;
    return mQ&&mC;
  });

  const NavBtn = ({id,label,icon})=>(
    <button onClick={()=>setPage(id)} style={{ background:page===id?(D?"#1e2d1e":"#dcfce7"):"transparent", color:page===id?acc:mute, border:"none", borderRadius:8, padding:"8px 14px", fontWeight:600, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all .15s" }}>
      {icon&&<Icon n={icon} s={15}/>} {label}
    </button>
  );

  return (
    <div style={{ minHeight:"100vh", background:bg, color:txt, fontFamily:"'Segoe UI',system-ui,sans-serif", transition:"background .3s,color .3s" }}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:${D?"#2d3347":"#cbd5e1"};border-radius:3px}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        input::placeholder,textarea::placeholder{color:${mute}}
        select option{background:${D?"#1e2538":"#fff"}}
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:D?"rgba(15,17,23,0.93)":"rgba(248,250,252,0.93)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${bdr}`, padding:"0 20px", display:"flex", alignItems:"center", gap:6, height:60, flexWrap:"wrap" }}>
        <button onClick={()=>setPage("home")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:9, marginRight:14 }}>
          <div style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", borderRadius:8, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon n="cube" s={17}/></div>
          <span style={{ fontWeight:900, fontSize:20, color:acc, letterSpacing:-.5 }}>{t.siteName}</span>
        </button>
        <NavBtn id="home" label={t.home}/>
        <NavBtn id="mods" label={t.mods} icon="cube"/>
        {isAdmin&&<NavBtn id="admin" label={t.admin} icon="shld"/>}
        <div style={{ flex:1 }}/>
        <button onClick={()=>setLang(l=>l==="en"?"tr":"en")} style={{ background:D?"#1e2538":"#e2e8f0", border:"none", borderRadius:8, padding:"7px 11px", color:txt, fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}><Icon n="glob" s={13}/> {lang==="en"?"TR":"EN"}</button>
        <button onClick={()=>setDark(d=>!d)} style={{ background:D?"#1e2538":"#e2e8f0", border:"none", borderRadius:8, padding:"7px 9px", cursor:"pointer", color:txt, display:"flex", alignItems:"center" }}><Icon n={D?"sun":"moon"} s={16}/></button>
        {session ? (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:D?"#1e2538":"#e2e8f0", borderRadius:8 }}>
              <Icon n="user" s={14}/> <span style={{ fontSize:13, fontWeight:600 }}>{session.username}</span>
              {session.isAdmin&&<span style={{ fontSize:10, background:"#f59e0b", color:"#000", padding:"1px 6px", borderRadius:20, fontWeight:800 }}>ADMIN</span>}
            </div>
            <button onClick={handleLogout} style={{ background:"#ef4444", border:"none", borderRadius:8, padding:"7px 13px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>{t.logout}</button>
          </div>
        ) : (
          <div style={{ display:"flex", gap:7 }}>
            <button onClick={()=>{setPage("auth");setAuthMode("login");}} style={{ background:D?"#1e2538":"#e2e8f0", border:"none", borderRadius:8, padding:"7px 13px", color:txt, fontWeight:600, fontSize:13, cursor:"pointer" }}>{t.login}</button>
            <button onClick={()=>{setPage("auth");setAuthMode("register");}} style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:8, padding:"7px 13px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>{t.register}</button>
          </div>
        )}
      </nav>

      {/* ANA SAYFA */}
      {page==="home"&&(
        <div style={{ animation:"fadeIn .4s ease" }}>
          <div style={{ background:D?"linear-gradient(160deg,#0f1117,#0d2012 55%,#0f1117)":"linear-gradient(160deg,#f0fdf4,#dcfce7 55%,#f0fdf4)", borderBottom:`1px solid ${bdr}`, padding:"76px 24px 56px", textAlign:"center" }}>
            <div style={{ maxWidth:660, margin:"0 auto" }}>
              <h1 style={{ fontSize:52, fontWeight:900, margin:"0 0 14px", letterSpacing:-2, lineHeight:1.05 }}><span style={{ color:acc }}>Mod</span>Vault</h1>
              <p style={{ fontSize:17, color:mute, margin:"0 0 34px", lineHeight:1.6 }}>{t.tagline}</p>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={()=>setPage("mods")} style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:10, padding:"13px 30px", color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer" }}>{t.mods} →</button>
                {!session&&<button onClick={()=>{setPage("auth");setAuthMode("register");}} style={{ background:D?"#1e2538":"#fff", border:`1px solid ${bdr}`, borderRadius:10, padding:"13px 30px", color:txt, fontWeight:700, fontSize:16, cursor:"pointer" }}>{t.register}</button>}
              </div>
            </div>
          </div>
          <div style={{ maxWidth:960, margin:"0 auto", padding:"48px 24px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18, marginBottom:44 }}>
              {[{label:t.totalMods,val:mods.length,icon:"cube",col:"#22c55e"},{label:t.totalDl,val:mods.reduce((a,m)=>a+(m.downloads||0),0).toLocaleString(),icon:"dl",col:"#3b82f6"},{label:t.totalUsers,val:users.length,icon:"user",col:"#f59e0b"}].map((s,i)=>(
                <div key={i} style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:14, padding:"26px 22px", textAlign:"center" }}>
                  <div style={{ color:s.col, marginBottom:8 }}><Icon n={s.icon} s={26}/></div>
                  <div style={{ fontSize:30, fontWeight:900, color:txt }}>{s.val}</div>
                  <div style={{ fontSize:13, color:mute, marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {mods.filter(m=>m.featured).length>0&&<>
              <h2 style={{ fontSize:21, fontWeight:800, marginBottom:18 }}>⭐ {t.featured}</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:18 }}>
                {mods.filter(m=>m.featured).map(m=><ModCard key={m.id} mod={m} lang={lang} onDownload={handleDownload} dark={D} dlLoading={dlLoading}/>)}
              </div>
            </>}
          </div>
        </div>
      )}

      {/* MODLAR */}
      {page==="mods"&&(
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"38px 24px", animation:"fadeIn .4s ease" }}>
          <h1 style={{ fontSize:28, fontWeight:900, marginBottom:22 }}>{t.latestMods}</h1>
          <div style={{ display:"flex", gap:10, marginBottom:28, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:200, position:"relative" }}>
              <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:mute, pointerEvents:"none" }}><Icon n="srch" s={15}/></span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search} style={{ ...inp, paddingLeft:38 }}/>
            </div>
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ ...inp, width:"auto", minWidth:150 }}>
              {t.catKeys.map((k,i)=><option key={k} value={k}>{t.categories[i]}</option>)}
            </select>
          </div>
          {filtered.length===0
            ? <div style={{ textAlign:"center", padding:"80px 0", color:mute }}><Icon n="cube" s={46}/><br/><br/>{t.noMods}</div>
            : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:18 }}>
                {filtered.map(m=><ModCard key={m.id} mod={m} lang={lang} onDownload={handleDownload} dark={D} dlLoading={dlLoading}/>)}
              </div>}
        </div>
      )}

      {/* AUTH */}
      {page==="auth"&&(
        <div style={{ minHeight:"calc(100vh - 60px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, animation:"fadeIn .4s ease" }}>
          <div style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:16, padding:"38px 34px", width:"100%", maxWidth:410, boxShadow:`0 20px 60px ${D?"rgba(0,0,0,.5)":"rgba(0,0,0,.08)"}` }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", borderRadius:12, width:50, height:50, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}><Icon n={authMode==="login"?"user":"shld"} s={22}/></div>
              <h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>{authMode==="login"?t.login:t.register}</h2>
            </div>
            <div style={{ display:"flex", background:D?"#1e2538":"#e2e8f0", borderRadius:10, padding:4, marginBottom:24 }}>
              {["login","register"].map(m=>(
                <button key={m} onClick={()=>setAuthMode(m)} style={{ flex:1, border:"none", borderRadius:8, padding:"9px", background:authMode===m?(D?"#2d3347":"#fff"):"transparent", color:authMode===m?txt:mute, fontWeight:700, fontSize:13, cursor:"pointer", transition:"all .2s" }}>
                  {m==="login"?t.login:t.register}
                </button>
              ))}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              {authMode==="register"&&<div><label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{t.username}</label><input value={form.username||""} onChange={e=>setForm(p=>({...p,username:e.target.value}))} placeholder={t.username} style={inp}/></div>}
              <div><label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{t.email}</label><input value={form.email||""} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder={t.email} type="email" style={inp}/></div>
              <div><label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{t.password}</label><input value={form.password||""} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder={t.password} type="password" style={inp} onKeyDown={e=>e.key==="Enter"&&handleAuth()}/></div>
              <button onClick={handleAuth} style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:10, padding:"12px", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", marginTop:2 }}>{authMode==="login"?t.loginBtn:t.registerBtn}</button>
              <div style={{ textAlign:"center", fontSize:13, color:mute }}>
                {authMode==="login"?t.noAccount:t.hasAccount}{" "}
                <button onClick={()=>setAuthMode(m=>m==="login"?"register":"login")} style={{ background:"none", border:"none", color:acc, fontWeight:700, cursor:"pointer", fontSize:13 }}>{authMode==="login"?t.register:t.login}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN */}
      {page==="admin"&&(
        <div style={{ maxWidth:1000, margin:"0 auto", padding:"38px 24px", animation:"fadeIn .4s ease" }}>
          {!isAdmin ? <div style={{ textAlign:"center", padding:"80px 0", color:mute }}><Icon n="shld" s={46}/><br/><br/>{t.adminOnly}</div> : <>
            <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:30 }}>
              <div style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", borderRadius:10, padding:10 }}><Icon n="shld" s={20}/></div>
              <h1 style={{ margin:0, fontSize:26, fontWeight:900 }}>{t.adminTitle}</h1>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:28 }}>
              {[{label:t.totalMods,val:mods.length,col:"#22c55e"},{label:t.totalDl,val:mods.reduce((a,m)=>a+(m.downloads||0),0),col:"#3b82f6"},{label:t.totalUsers,val:users.length,col:"#f59e0b"}].map((s,i)=>(
                <div key={i} style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:12, padding:"18px 20px" }}><div style={{ fontSize:26, fontWeight:900, color:s.col }}>{s.val}</div><div style={{ fontSize:13, color:mute, marginTop:2 }}>{s.label}</div></div>
              ))}
            </div>
            <div style={{ display:"flex", gap:3, background:D?"#1e2538":"#e2e8f0", borderRadius:10, padding:4, marginBottom:24, width:"fit-content" }}>
              {["upload","manage"].map(tab=>(
                <button key={tab} onClick={()=>setAdminTab(tab)} style={{ border:"none", borderRadius:8, padding:"9px 18px", background:adminTab===tab?(D?"#2d3347":"#fff"):"transparent", color:adminTab===tab?txt:mute, fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                  <Icon n={tab==="upload"?"up":"cube"} s={13}/> {tab==="upload"?t.uploadTab:t.manageTab}
                </button>
              ))}
            </div>

            {adminTab==="upload"&&(
              <div style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:14, padding:"26px 26px" }}>
                <h2 style={{ margin:"0 0 22px", fontSize:17, fontWeight:700 }}>{t.uploadTab}</h2>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  {[["name",t.modName],["nametr",t.modNameTR],["version",t.modVersion],["mcVersion",t.modMcVersion],["forge",t.modForge],["size",t.modSize],["cat",t.modCat],["cattr",t.modCatTR]].map(([k,label])=>(
                    <div key={k}><label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{label}</label><input value={form[k]||""} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={inp}/></div>
                  ))}
                  <div style={{ gridColumn:"1/-1" }}><label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{t.modDesc}</label><textarea value={form.desc||""} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} rows={3} style={{ ...inp, resize:"vertical" }}/></div>
                  <div style={{ gridColumn:"1/-1" }}><label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{t.modDescTR}</label><textarea value={form.desctr||""} onChange={e=>setForm(p=>({...p,desctr:e.target.value}))} rows={3} style={{ ...inp, resize:"vertical" }}/></div>
                  <div style={{ gridColumn:"1/-1" }}>
                    <label style={{ fontSize:12, fontWeight:600, color:mute, display:"block", marginBottom:5 }}>{t.modFile}</label>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <input ref={fileRef} type="file" accept=".jar,.zip" onChange={handleFile} style={{ display:"none" }}/>
                      <button onClick={()=>fileRef.current?.click()} style={{ background:D?"#1e2538":"#e2e8f0", border:`1px solid ${bdr}`, borderRadius:8, padding:"10px 16px", color:txt, fontWeight:600, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Icon n="file" s={14}/> Dosya Seç</button>
                      {form.fileName&&<span style={{ fontSize:13, color:acc, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}><Icon n="chk" s={14}/> {form.fileName}</span>}
                    </div>
                  </div>
                  <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:9 }}>
                    <input type="checkbox" id="featChk" checked={form.featured||false} onChange={e=>setForm(p=>({...p,featured:e.target.checked}))} style={{ width:17, height:17, accentColor:acc }}/>
                    <label htmlFor="featChk" style={{ fontSize:13, fontWeight:600, cursor:"pointer" }}>{t.modFeatured}</label>
                  </div>
                </div>
                <button onClick={handleUpload} style={{ marginTop:22, background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:10, padding:"11px 26px", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Icon n="up" s={15}/> {t.uploadBtn}</button>
              </div>
            )}

            {adminTab==="manage"&&(
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {mods.length===0&&<div style={{ textAlign:"center", padding:"60px", color:mute }}><Icon n="cube" s={40}/><br/><br/>{t.noMods}</div>}
                {mods.map(m=>(
                  editMod?.id===m.id ? (
                    <div key={m.id} style={{ background:surf, border:`2px solid ${acc}`, borderRadius:14, padding:"20px 22px" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                        {[["name","Ad (EN)"],["nametr","Ad (TR)"],["version","Sürüm"],["mcVersion","MC Sürüm"],["cat","Kategori (EN)"],["cattr","Kategori (TR)"]].map(([k,label])=>(
                          <div key={k}><label style={{ fontSize:11, color:mute, display:"block", marginBottom:3 }}>{label}</label><input value={editMod[k]||""} onChange={e=>setEditMod(p=>({...p,[k]:e.target.value}))} style={inp}/></div>
                        ))}
                        <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:8 }}>
                          <input type="checkbox" id={`fe${m.id}`} checked={editMod.featured||false} onChange={e=>setEditMod(p=>({...p,featured:e.target.checked}))} style={{ width:15, height:15, accentColor:acc }}/>
                          <label htmlFor={`fe${m.id}`} style={{ fontSize:13, fontWeight:600, cursor:"pointer" }}>{t.modFeatured}</label>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:9 }}>
                        <button onClick={handleSave} style={{ background:acc, border:"none", borderRadius:8, padding:"8px 18px", color:"#fff", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:13 }}><Icon n="chk" s={13}/> {t.saveBtn}</button>
                        <button onClick={()=>setEditMod(null)} style={{ background:D?"#2d3347":"#e2e8f0", border:"none", borderRadius:8, padding:"8px 18px", color:txt, fontWeight:700, cursor:"pointer", fontSize:13 }}>{t.cancelBtn}</button>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14 }}>{m.name}{m.nametr&&m.nametr!==m.name?` / ${m.nametr}`:""}</div>
                        <div style={{ fontSize:12, color:mute, marginTop:2 }}>v{m.version} · MC {m.mcVersion} · {m.cat} · ⬇ {m.downloads||0}</div>
                      </div>
                      {m.featured&&<span style={{ fontSize:11, background:"#f59e0b", color:"#000", padding:"2px 7px", borderRadius:20, fontWeight:800 }}>★</span>}
                      <button onClick={()=>setEditMod({...m})} style={{ background:D?"#1e2538":"#e2e8f0", border:"none", borderRadius:7, padding:"7px 12px", color:txt, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:12 }}><Icon n="edit" s={13}/> {t.editBtn}</button>
                      <button onClick={()=>handleDelete(m)} style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:7, padding:"7px 12px", color:"#ef4444", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:12 }}><Icon n="del" s={13}/> {t.deleteBtn}</button>
                    </div>
                  )
                ))}
              </div>
            )}
          </>}
        </div>
      )}

      <footer style={{ borderTop:`1px solid ${bdr}`, padding:"24px", textAlign:"center", color:mute, fontSize:13, marginTop:60 }}>
        <span style={{ fontWeight:800, color:acc }}>ModVault</span> — Minecraft Mod Hub © {new Date().getFullYear()}
      </footer>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
}
ENDOFFILE
echo "ok"
Output

ok
Done

You are out of free messages until 10:10 PM
