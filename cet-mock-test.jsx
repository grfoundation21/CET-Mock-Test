import { useState, useEffect, useCallback, useMemo } from "react";

// ═══ THEME ═══
const C = {
  primary:"#2563eb", primaryDark:"#1d4ed8", blue50:"#eff6ff", blue100:"#dbeafe",
  green:"#16a34a", greenBg:"#f0fdf4", red:"#dc2626", redBg:"#fef2f2",
  orange:"#ea580c", orangeBg:"#fff7ed", purple:"#7c3aed", purpleBg:"#f5f3ff",
  gray50:"#f9fafb", gray100:"#f3f4f6", gray200:"#e5e7eb", gray300:"#d1d5db",
  gray400:"#9ca3af", gray500:"#6b7280", gray600:"#4b5563", gray700:"#374151",
  gray800:"#1f2937", gray900:"#111827", bg:"#f8f9fb", white:"#ffffff",
};

const LOGO_BASE64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTYwIDQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcng9IjgiIGZpbGw9IiMwRTFCMkUiLz48dGV4dCB4PSIxMiIgeT0iMjgiIGZpbGw9IiNmZmYiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSI4MDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5HUjwvdGV4dD48dGV4dCB4PSI0OCIgeT0iMTgiIGZpbGw9IiMxZjI5MzciIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSI4MDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBsZXR0ZXItc3BhY2luZz0iMSI+R1IgRURVQ0FUSU9OQUw8L3RleHQ+PHRleHQgeD0iNDgiIHk9IjMyIiBmaWxsPSIjMjU2M2ViIiBmb250LXNpemU9IjkiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXN0eWxlPSJpdGFsaWMiPldpdGggeW91IGF0IGV2ZXJ5IHN0ZXA8L3RleHQ+PC9zdmc+";

// ═══ QUESTIONS DATABASE (Unified Chapters) ═══
const QUESTIONS_DB = {
  Physics: [
    { id:1, q:"A ball is thrown vertically upward with velocity 20 m/s. Find the maximum height.", options:["10m","20m","30m","40m"], correct:1, chapter:"Kinematics", solution:"h=u²/2g=400/20=20m" },
    { id:2, q:"What is the SI unit of current?", options:["Volt","Ampere","Ohm","Watt"], correct:1, chapter:"Current Electricity", solution:"SI unit of current is Ampere (A)" },
    { id:3, q:"Which gas is evolved when zinc reacts with dilute HCl?", options:["Oxygen","Hydrogen","Nitrogen","Chlorine"], correct:1, chapter:"Optics", solution:"Zn+2HCl→ZnCl₂+H₂" },
    { id:4, q:"The focal length of a convex lens is 20 cm. What is its power?", options:["+2D","+5D","-5D","+10D"], correct:1, chapter:"Optics", solution:"P=1/f=1/0.2=+5D" },
    { id:5, q:"Newton's first law is also known as:", options:["Law of inertia","Law of acceleration","Law of reaction","Law of gravitation"], correct:0, chapter:"Laws of Motion", solution:"Newton's first law = Law of Inertia" },
  ],
  Chemistry: [
    { id:6, q:"Which gas is evolved when zinc reacts with dilute HCl?", options:["Oxygen","Hydrogen","Nitrogen","Chlorine"], correct:1, chapter:"Chemical Reactions", solution:"Zn+2HCl→ZnCl₂+H₂" },
    { id:7, q:"What is the atomic number of Carbon?", options:["4","6","8","12"], correct:1, chapter:"Chemical Bonding", solution:"Carbon has atomic number 6" },
    { id:8, q:"pH of pure water at 25°C is:", options:["0","7","14","1"], correct:1, chapter:"Ionic Equilibrium", solution:"Pure water has pH=7 (neutral)" },
    { id:9, q:"Benzene formula is:", options:["C₆H₆","C₆H₁₂","C₂H₂","CH₄"], correct:0, chapter:"Organic Chemistry", solution:"Benzene = C₆H₆" },
    { id:10, q:"Which element has highest electronegativity?", options:["Oxygen","Fluorine","Chlorine","Nitrogen"], correct:1, chapter:"Periodic Table", solution:"Fluorine is most electronegative" },
  ],
  Mathematics: [
    { id:11, q:"What is the derivative of x²?", options:["x","2x","x²","2x²"], correct:1, chapter:"Differentiation", solution:"d/dx(x²)=2x" },
    { id:12, q:"∫2x dx = ?", options:["x²+C","2x²+C","x+C","x²"], correct:0, chapter:"Integration", solution:"∫2x dx = x² + C" },
    { id:13, q:"If A is a 2×2 matrix with |A|=5, then |3A|=?", options:["15","45","9","25"], correct:1, chapter:"Matrices", solution:"|kA|=k^n|A|=9×5=45" },
    { id:14, q:"The lim(x→0) sin(x)/x = ?", options:["0","1","∞","−1"], correct:1, chapter:"Limits", solution:"Standard limit: lim sin(x)/x = 1" },
    { id:15, q:"If P(A)=0.3, P(B)=0.4, A,B independent, P(A∩B)=?", options:["0.12","0.7","0.1","0.3"], correct:0, chapter:"Probability", solution:"P(A∩B)=P(A)×P(B)=0.12" },
  ]
};

const ALL_QUESTIONS = [
  ...QUESTIONS_DB.Physics.map(q => ({...q, subject:"Physics"})),
  ...QUESTIONS_DB.Chemistry.map(q => ({...q, subject:"Chemistry"})),
  ...QUESTIONS_DB.Mathematics.map(q => ({...q, subject:"Mathematics"})),
];
const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];

// ═══ UI COMPONENTS ═══
const fmtTime = (s) => { const m=Math.floor(s/60); const sc=s%60; return `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}:${String(sc).padStart(2,"0")}`; };

function useTimer(seconds, active) {
  const [time, setTime] = useState(seconds);
  useEffect(() => { setTime(seconds); }, [seconds]);
  useEffect(() => { if (!active) return; if (time <= 0) return; const t = setInterval(() => setTime(p => Math.max(0, p-1)), 1000); return () => clearInterval(t); }, [active, time]);
  return time;
}

const Icon = {
  arrow: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  file: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>,
  chart: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  book: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  download: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>,
};

function Card({ children, style={}, ...props }) {
  return <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.gray200}`, padding:"18px 22px", ...style }} {...props}>{children}</div>;
}

function Btn({ children, variant="primary", icon, style={}, ...props }) {
  const base = { display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", border:"none", transition:"all 0.15s", fontFamily:"inherit" };
  const vars = { primary:{background:C.primary,color:"#fff"}, success:{background:C.green,color:"#fff"}, danger:{background:C.red,color:"#fff"}, outline:{background:"transparent",border:`1.5px solid ${C.gray300}`,color:C.gray700}, ghost:{background:"transparent",color:C.gray500}, purple:{background:C.purple,color:"#fff"} };
  return <button style={{...base,...(vars[variant]||vars.primary),...style}} {...props}>{icon}{children}</button>;
}

function Field({ label, value, onChange, type="text", placeholder="", style={} }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.gray600, marginBottom:5 }}>{label}</label>}
      <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.gray200}`, fontSize:14, color:C.gray800, outline:"none", ...style }} />
    </div>
  );
}

function Select({ label, value, onChange, options=[] }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.gray600, marginBottom:5 }}>{label}</label>}
      <select value={value||""} onChange={e=>onChange(e.target.value)} style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.gray200}`, fontSize:14, color:C.gray800, background:C.white }}>
        <option value="">Select...</option>
        {options.map(o => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function NavBar() {
  return (
    <div style={{ background:"#fff", borderBottom:`1px solid ${C.gray200}`, padding:"10px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <img src={LOGO_BASE64} alt="GR Educational" style={{ height:36 }} />
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:13, color:C.gray500 }}>student@demo.com</span>
        <div style={{ width:32, height:32, borderRadius:"50%", background:C.primary, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>S</div>
      </div>
    </div>
  );
}

// ═══ SIGN IN ═══
function SignIn({ onSignIn, onRegister }) {
  const [mode, setMode] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [email, setEmail] = useState("student@demo.com");
  const [pass, setPass] = useState("demo123");
  const [forgotMobile, setForgotMobile] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPassConfirm, setNewPassConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { if (otpTimer > 0) { const t = setTimeout(() => setOtpTimer(otpTimer-1), 1000); return () => clearTimeout(t); } }, [otpTimer]);

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg, ${C.blue50} 0%, #f0f2f5 50%, ${C.blue50} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <Card style={{ width:"100%", maxWidth:420, padding:"40px 36px", boxShadow:"0 8px 40px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg, #0E1B2E, #1E3A5F)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:20, marginBottom:14 }}>GR</div>
          <h1 style={{ fontSize:24, fontWeight:800, color:C.gray900, margin:0 }}>{mode === "forgot" ? "Reset Password" : "Welcome Back"}</h1>
          <p style={{ color:C.gray500, fontSize:14, marginTop:6 }}>{mode === "forgot" ? "Enter mobile to reset" : "GR Educational Consultancy"}</p>
        </div>
        {error && <div style={{ background:C.redBg, color:C.red, padding:"8px 14px", borderRadius:8, fontSize:13, marginBottom:14 }}>{error}</div>}
        {success && <div style={{ background:C.greenBg, color:C.green, padding:"8px 14px", borderRadius:8, fontSize:13, marginBottom:14 }}>{success}</div>}

        {mode === "forgot" && <>
          {forgotStep === 1 && <><Field label="Registered Mobile" value={forgotMobile} onChange={v=>setForgotMobile(v.replace(/\D/g,"").slice(0,10))} placeholder="10-digit mobile" /><Btn onClick={()=>{if(forgotMobile.length!==10){setError("Enter valid mobile");return;}setError("");setForgotStep(2);setOtpTimer(30);}} style={{width:"100%",justifyContent:"center"}}>Send OTP</Btn></>}
          {forgotStep === 2 && <><div style={{background:C.gray50,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,color:C.gray600}}>OTP sent to +91 {forgotMobile} {otpTimer>0&&<span style={{color:C.orange}}>· {otpTimer}s</span>}</div><Field label="Enter OTP" value={forgotOtp} onChange={v=>setForgotOtp(v.replace(/\D/g,"").slice(0,6))} /><Btn onClick={()=>{if(forgotOtp.length<4){setError("Enter valid OTP");return;}setError("");setForgotStep(3);}} style={{width:"100%",justifyContent:"center"}}>Verify OTP</Btn></>}
          {forgotStep === 3 && <><Field label="New Password" value={newPass} onChange={setNewPass} type="password" placeholder="Min 6 characters" /><Field label="Confirm Password" value={newPassConfirm} onChange={setNewPassConfirm} type="password" /><Btn onClick={()=>{if(newPass.length<6){setError("Min 6 characters");return;}if(newPass!==newPassConfirm){setError("Passwords don't match");return;}setSuccess("Password reset! Please login.");setTimeout(()=>{setMode("mobile");setSuccess("");setForgotStep(1);},2000);}} variant="success" style={{width:"100%",justifyContent:"center"}}>Reset Password</Btn></>}
          <p style={{textAlign:"center",marginTop:16,fontSize:13}}><span onClick={()=>{setMode("mobile");setError("");setForgotStep(1);}} style={{color:C.primary,cursor:"pointer",fontWeight:600}}>← Back to Login</span></p>
        </>}

        {mode !== "forgot" && <>
          <div style={{ display:"flex", gap:2, background:C.gray100, borderRadius:8, padding:3, marginBottom:20 }}>
            {[{v:"mobile",l:"📱 Mobile OTP"},{v:"email",l:"📧 Email"}].map(t=>(
              <button key={t.v} onClick={()=>{setMode(t.v);setError("");}} style={{flex:1,padding:"8px",fontSize:13,fontWeight:600,borderRadius:6,border:"none",cursor:"pointer",background:mode===t.v?"#fff":"transparent",color:mode===t.v?C.gray800:C.gray500,boxShadow:mode===t.v?"0 1px 3px rgba(0,0,0,0.1)":"none"}}>{t.l}</button>
            ))}
          </div>
          {mode === "mobile" && <>
            <Field label="Mobile Number" value={mobile} onChange={v=>{setMobile(v.replace(/\D/g,"").slice(0,10));setOtpSent(false);}} type="tel" placeholder="10-digit mobile" />
            {!otpSent ? <Btn onClick={()=>{if(mobile.length!==10){setError("Enter valid mobile");return;}setError("");setOtpSent(true);setOtpTimer(30);}} style={{width:"100%",justifyContent:"center",background:"linear-gradient(135deg,#0E1B2E,#1E3A5F)"}}>Send OTP</Btn> : <>
              <div style={{background:"#f0fdf4",borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:13,color:C.green,display:"flex",justifyContent:"space-between"}}><span>OTP sent to +91 {mobile}</span>{otpTimer>0?<span style={{color:C.orange,fontWeight:600}}>{otpTimer}s</span>:<button onClick={()=>setOtpTimer(30)} style={{background:"none",border:"none",color:C.primary,fontWeight:600,cursor:"pointer",fontSize:13}}>Resend</button>}</div>
              <Field label="Enter OTP" value={otp} onChange={v=>setOtp(v.replace(/\D/g,"").slice(0,6))} placeholder="6-digit OTP" />
              <Btn onClick={()=>{if(otp.length<4){setError("Enter valid OTP");return;}onSignIn();}} variant="success" style={{width:"100%",justifyContent:"center"}}>Verify & Login</Btn>
            </>}
          </>}
          {mode === "email" && <>
            <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="Enter email" />
            <Field label="Password" value={pass} onChange={setPass} type="password" placeholder="Enter password" />
            <Btn onClick={()=>onSignIn()} style={{width:"100%",justifyContent:"center"}}>Sign In</Btn>
          </>}
          <div style={{textAlign:"right",marginTop:12}}><span onClick={()=>{setMode("forgot");setError("");}} style={{fontSize:13,color:C.primary,cursor:"pointer"}}>Forgot Password?</span></div>
          <div style={{borderTop:`1px solid ${C.gray200}`,marginTop:16,paddingTop:16}}><p style={{textAlign:"center",fontSize:13,color:C.gray500}}>New student? <span onClick={onRegister} style={{color:C.primary,cursor:"pointer",fontWeight:600}}>Register here</span></p></div>
        </>}
      </Card>
    </div>
  );
}

// ═══ REGISTRATION ═══
function Registration({ onDone }) {
  const [form, setForm] = useState({ first:"", last:"", mobile:"", email:"", stream:"", course:"", studentClass:"", pass:"", confirm:"" });
  const [step, setStep] = useState(1);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpCode, setOtpCode] = useState("");
  const [verifyMethod, setVerifyMethod] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { if (otpTimer > 0) { const t = setTimeout(() => setOtpTimer(otpTimer-1), 1000); return () => clearTimeout(t); } }, [otpTimer]);

  const STREAM_COURSES = {
    "Engineering":{icon:"⚙️",courses:["MHT CET PCM","JEE Main","JEE Advanced"]},
    "Medical":{icon:"🩺",courses:["MHT CET PCB","NEET UG","NEET PG"]},
    "Agriculture":{icon:"🌾",courses:["Agriculture CET"]},
    "Pharmacy":{icon:"💊",courses:["B.Pharma CET","D.Pharma CET"]},
    "Management":{icon:"💼",courses:["MBA CET","CAT","MAT"]},
    "Law":{icon:"⚖️",courses:["MH Law CET","CLAT","AILET"]},
    "Nursing":{icon:"🏥",courses:["B.Sc Nursing CET"]},
    "Education":{icon:"📚",courses:["B.Ed CET","D.Ed CET"]},
    "Design":{icon:"🎨",courses:["NID","NIFT","UCEED"]},
  };
  const CLASS_OPTIONS = [{value:"11",label:"11th"},{value:"12",label:"12th"},{value:"repeater",label:"Repeater"},{value:"dropper",label:"Dropper"},{value:"graduate",label:"Graduate"}];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <Card style={{ width:"100%", maxWidth:540, padding:"36px 32px" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"linear-gradient(135deg,#0E1B2E,#1E3A5F)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:18, marginBottom:12 }}>GR</div>
          <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, margin:0 }}>New Registration</h1>
        </div>
        <div style={{ display:"flex", gap:4, marginBottom:24 }}>
          {["Personal Info","Stream & Exam","Verify","Password"].map((s,i) => (
            <div key={i} style={{ flex:1, textAlign:"center" }}>
              <div style={{ height:4, borderRadius:2, background:i<step?C.green:i===step-1?C.primary:C.gray200, marginBottom:6 }} />
              <span style={{ fontSize:10, color:i<step?C.green:C.gray500, fontWeight:600 }}>{s}</span>
            </div>
          ))}
        </div>
        {error && <div style={{ background:C.redBg, color:C.red, padding:"8px 14px", borderRadius:8, fontSize:13, marginBottom:14 }}>{error}</div>}

        {step === 1 && <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}><Field label="First Name *" value={form.first} onChange={v=>setForm({...form,first:v})} /><Field label="Last Name" value={form.last} onChange={v=>setForm({...form,last:v})} /></div>
          <Field label="Mobile *" value={form.mobile} onChange={v=>setForm({...form,mobile:v.replace(/\D/g,"").slice(0,10)})} type="tel" placeholder="10-digit mobile" />
          <Field label="Email (optional)" value={form.email} onChange={v=>setForm({...form,email:v})} type="email" />
          <Btn onClick={()=>{if(!form.first.trim()){setError("First name required");return;}if(form.mobile.length!==10){setError("Enter valid mobile");return;}setError("");setStep(2);}} style={{width:"100%",justifyContent:"center"}}>Continue →</Btn>
          <p style={{textAlign:"center",marginTop:16,fontSize:13,color:C.gray500}}>Already registered? <span onClick={onDone} style={{color:C.primary,cursor:"pointer",fontWeight:600}}>Sign In</span></p>
        </>}

        {step === 2 && <>
          <label style={{fontSize:13,fontWeight:600,color:C.gray700,display:"block",marginBottom:6}}>1. Select Stream *</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:14}}>
            {Object.entries(STREAM_COURSES).map(([stream,data])=>(
              <button key={stream} onClick={()=>setForm({...form,stream,course:""})} style={{padding:"10px 8px",borderRadius:10,border:`2px solid ${form.stream===stream?C.primary:C.gray200}`,background:form.stream===stream?C.blue50:"#fff",cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:2}}>{data.icon}</div>
                <div style={{fontSize:11,fontWeight:form.stream===stream?700:500,color:form.stream===stream?C.primary:C.gray600}}>{stream}</div>
              </button>
            ))}
          </div>
          {form.stream && <><label style={{fontSize:13,fontWeight:600,color:C.gray700,display:"block",marginBottom:6}}>2. Select Entrance Exam *</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
              {(STREAM_COURSES[form.stream]?.courses||[]).map(course=>(
                <button key={course} onClick={()=>setForm({...form,course})} style={{padding:"10px 14px",borderRadius:10,border:`2px solid ${form.course===course?C.primary:C.gray200}`,background:form.course===course?C.blue50:"#fff",cursor:"pointer",textAlign:"left"}}>
                  <div style={{fontSize:13,fontWeight:form.course===course?700:500,color:form.course===course?C.primary:C.gray700}}>{course}</div>
                </button>
              ))}
            </div></>}
          {form.course && <><label style={{fontSize:13,fontWeight:600,color:C.gray700,display:"block",marginBottom:6}}>3. Select Class *</label>
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {CLASS_OPTIONS.map(c=>(<button key={c.value} onClick={()=>setForm({...form,studentClass:c.value})} style={{padding:"8px 16px",borderRadius:8,border:`2px solid ${form.studentClass===c.value?C.primary:C.gray200}`,background:form.studentClass===c.value?C.blue50:"#fff",cursor:"pointer",fontSize:13,fontWeight:form.studentClass===c.value?700:500,color:form.studentClass===c.value?C.primary:C.gray600}}>{c.label}</button>))}
            </div></>}
          {form.stream&&form.course&&form.studentClass&&<div style={{background:C.greenBg,borderRadius:8,padding:"8px 14px",marginBottom:12,fontSize:12,color:C.green,fontWeight:600}}>✓ {form.stream} → {form.course} → Class {form.studentClass}</div>}
          <div style={{display:"flex",gap:10}}><Btn variant="ghost" onClick={()=>{setStep(1);setError("");}}>← Back</Btn><Btn onClick={()=>{if(!form.stream){setError("Select stream");return;}if(!form.course){setError("Select exam");return;}if(!form.studentClass){setError("Select class");return;}setError("");setStep(3);}} style={{flex:1,justifyContent:"center"}}>Continue →</Btn></div>
        </>}

        {step === 3 && <>
          <Card style={{background:C.gray50,marginBottom:16,padding:"14px 18px"}}><div style={{fontSize:13,color:C.gray600,lineHeight:2}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>Name:</span><strong>{form.first} {form.last}</strong></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>Stream:</span><strong>{form.stream}</strong></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>Exam:</span><strong style={{color:C.primary}}>{form.course}</strong></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>Class:</span><strong>{CLASS_OPTIONS.find(c=>c.value===form.studentClass)?.label}</strong></div>
          </div></Card>
          {!mobileVerified ? <>
            {!verifyMethod && <><label style={{fontSize:13,fontWeight:600,color:C.gray700,display:"block",marginBottom:8}}>Verify your identity (choose one)</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:8}}>
                <button onClick={()=>setVerifyMethod("mobile")} style={{padding:"16px",borderRadius:10,border:`2px solid ${C.gray200}`,background:"#fff",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:28,marginBottom:6}}>📱</div><div style={{fontSize:14,fontWeight:700}}>Mobile OTP</div><div style={{fontSize:12,color:C.gray500}}>+91 {form.mobile}</div></button>
                <button onClick={()=>{if(!form.email){setError("No email entered");return;}setVerifyMethod("email");}} style={{padding:"16px",borderRadius:10,border:`2px solid ${C.gray200}`,background:form.email?"#fff":C.gray50,cursor:form.email?"pointer":"not-allowed",textAlign:"center",opacity:form.email?1:0.5}}><div style={{fontSize:28,marginBottom:6}}>📧</div><div style={{fontSize:14,fontWeight:700}}>Email OTP</div><div style={{fontSize:12,color:C.gray500}}>{form.email||"No email"}</div></button>
              </div></>}
            {verifyMethod && <Card style={{border:`1.5px solid ${C.gray200}`,padding:"16px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:22}}>{verifyMethod==="mobile"?"📱":"📧"}</span><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>Verify via {verifyMethod==="mobile"?"Mobile":"Email"}</div><div style={{fontSize:13,color:C.gray500}}>OTP sent to {verifyMethod==="mobile"?`+91 ${form.mobile}`:form.email}</div></div><button onClick={()=>{setVerifyMethod(null);setOtpSent(false);setOtpCode("");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.primary,fontWeight:600}}>Change</button></div>
              {!otpSent?<Btn onClick={()=>{setOtpSent(true);setOtpTimer(30);}} style={{width:"100%",justifyContent:"center"}}>Send OTP</Btn>:<>
                <div style={{background:"#f0fdf4",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:13,color:C.green,display:"flex",justifyContent:"space-between"}}><span>✓ OTP sent</span>{otpTimer>0?<span style={{color:C.orange,fontWeight:600}}>{otpTimer}s</span>:<button onClick={()=>setOtpTimer(30)} style={{background:"none",border:"none",color:C.primary,fontWeight:600,cursor:"pointer",fontSize:13}}>Resend</button>}</div>
                <Field label="Enter OTP" value={otpCode} onChange={v=>setOtpCode(v.replace(/\D/g,"").slice(0,6))} /><Btn onClick={()=>{if(otpCode.length<4){setError("Enter valid OTP");return;}setError("");setMobileVerified(true);}} variant="success" style={{width:"100%",justifyContent:"center"}}>Verify OTP</Btn></>}
            </Card>}
          </> : <Card style={{background:C.greenBg,border:`1px solid ${C.green}`,padding:"14px 18px",textAlign:"center"}}><span style={{fontSize:15,color:C.green,fontWeight:700}}>✓ {verifyMethod==="mobile"?`Mobile +91 ${form.mobile}`:`Email ${form.email}`} verified!</span></Card>}
          <div style={{display:"flex",gap:10,marginTop:14}}><Btn variant="ghost" onClick={()=>{setStep(2);setError("");}}>← Back</Btn><Btn onClick={()=>{if(!mobileVerified){setError("Please verify first");return;}setError("");setStep(4);}} disabled={!mobileVerified} style={{flex:1,justifyContent:"center"}}>Continue →</Btn></div>
        </>}

        {step === 4 && <>
          <Card style={{background:C.greenBg,border:`1px solid ${C.green}`,marginBottom:16,padding:"12px 16px",textAlign:"center"}}><span style={{fontSize:13,color:C.green,fontWeight:600}}>✓ Verified · {form.first} · {form.course} · Class {form.studentClass}</span></Card>
          <Field label="Create Password *" value={form.pass} onChange={v=>setForm({...form,pass:v})} type="password" placeholder="Min 6 characters" />
          <Field label="Confirm Password *" value={form.confirm} onChange={v=>setForm({...form,confirm:v})} type="password" />
          <div style={{display:"flex",gap:10}}><Btn variant="ghost" onClick={()=>setStep(3)}>← Back</Btn><Btn onClick={()=>{if(form.pass.length<6){setError("Min 6 characters");return;}if(form.pass!==form.confirm){setError("Passwords don't match");return;}onDone();}} variant="success" style={{flex:1,justifyContent:"center"}}>🎉 Complete Registration</Btn></div>
        </>}
      </Card>
    </div>
  );
}

// ═══ EDIT PROFILE ═══
function EditProfile({ onSave }) {
  const [profile, setProfile] = useState({ gender:"", dob:"", city:"" });
  return (
    <div style={{ minHeight:"100vh", background:C.bg }}><NavBar />
      <div style={{ maxWidth:480, margin:"0 auto", padding:"28px 20px" }}>
        <Card>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 6px" }}>Complete Your Profile</h2>
          <p style={{ fontSize:13, color:C.gray500, marginBottom:24 }}>All fields are optional</p>
          <Select label="Gender" value={profile.gender} onChange={v=>setProfile(p=>({...p,gender:v}))} options={["Male","Female","Other"]} />
          <div style={{marginBottom:16}}><label style={{fontSize:13,fontWeight:600,color:C.gray600,display:"block",marginBottom:6}}>Date of Birth</label><input type="date" value={profile.dob} onChange={e=>setProfile(p=>({...p,dob:e.target.value}))} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.gray300}`,fontSize:14}} /><span style={{fontSize:11,color:C.gray400,display:"block",marginTop:4}}>Optional</span></div>
          <div style={{marginBottom:20}}><label style={{fontSize:13,fontWeight:600,color:C.gray600,display:"block",marginBottom:6}}>City</label><input type="text" value={profile.city} onChange={e=>setProfile(p=>({...p,city:e.target.value}))} placeholder="Enter your city" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.gray300}`,fontSize:14}} /><span style={{fontSize:11,color:C.gray400,display:"block",marginTop:4}}>Optional — type any city name</span></div>
          <Btn onClick={onSave} style={{width:"100%",justifyContent:"center",padding:"12px"}}>Save & Proceed</Btn>
          <button onClick={onSave} style={{display:"block",width:"100%",textAlign:"center",marginTop:12,background:"none",border:"none",color:C.gray400,fontSize:13,cursor:"pointer"}}>Skip for now →</button>
        </Card>
      </div>
    </div>
  );
}

// ═══ DASHBOARD ═══
function Dashboard({ onLaunchTest, pastTests=[], onViewResult, onPragati, studentPlan, setStudentPlan }) {
  const [tab, setTab] = useState("available");
  const [showPlans, setShowPlans] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const student = { name:"Rahul Sharma", class:"12", course:"CET PCM", plan:studentPlan||"free" };

  const allTests = [
    {id:"t1",course:"CET-PCM",name:"Mock Test 1 — Full Syllabus",qs:15,dur:"30 min",status:"active",date:"10 Feb 2026",free:true,classes:["11","12"],category:"free"},
    {id:"t2",course:"CET-PCM",name:"Mock Test 2 — Physics Focus",qs:50,dur:"60 min",status:"active",date:"12 Feb 2026",free:false,price:49,classes:["12"],category:"paid"},
    {id:"t3",course:"CET-PCM",name:"Grand Test — Full Syllabus",qs:150,dur:"180 min",status:"active",date:"20 Feb 2026",free:false,price:99,classes:["12","repeater"],category:"paid"},
    {id:"t5",course:"CET-PCM",name:"Crash — Physics Complete",qs:200,dur:"240 min",status:"active",date:"1 Mar 2026",free:false,price:299,classes:["12","repeater"],category:"crash"},
    {id:"t6",course:"CET-PCM",name:"Crash — Chemistry Complete",qs:200,dur:"240 min",status:"active",date:"5 Mar 2026",free:false,price:299,classes:["12"],category:"crash"},
    {id:"t7",course:"CET-PCM",name:"Practice — Kinematics",qs:30,dur:"45 min",status:"active",date:"8 Feb 2026",free:true,classes:["11","12"],category:"free"},
  ];
  const myTests = allTests.filter(t=>(t.classes||[]).includes(student.class));
  const freeTests = myTests.filter(t=>t.category==="free"), paidTests = myTests.filter(t=>t.category==="paid"), crashTests = myTests.filter(t=>t.category==="crash");
  const canAccess = (t)=>t.free||student.plan==="premium"||(student.plan==="crash"&&(t.category==="crash"||t.category==="paid"));

  const PLANS = [
    {id:"free",name:"Free",price:0,icon:"🆓",color:C.green,features:["Free mock tests for your class","Basic result analysis","Limited attempts"],current:student.plan==="free"},
    {id:"premium",name:"Premium",price:499,period:"/year",icon:"👑",color:"#D97706",features:["All free tests","All paid mock tests","✨ Pragati topic monitoring","Detailed analysis + PDF","Unlimited attempts","WhatsApp result sharing"],current:student.plan==="premium",popular:true},
    {id:"crash",name:"Crash Course",price:999,period:"/course",icon:"🚀",color:"#DC2626",features:["Everything in Premium","All crash course tests (200 Qs each)","Subject-wise intensive tests","Priority doubt support"],current:student.plan==="crash"},
    {id:"topic",name:"Per Topic",price:49,period:"/topic",icon:"📝",color:"#7c3aed",features:["Buy individual Pragati topics","₹49 per topic only","Arambh + Shikhar + Retake","90 days access"],current:false},
  ];

  const handleBuyPlan = (planId)=>{setPaymentProcessing(true);setTimeout(()=>{setStudentPlan(planId);setPaymentProcessing(false);setShowPlans(false);},1500);};

  const TestCard = ({t})=>{const accessible=canAccess(t);return(
    <Card key={t.id} style={{padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:!accessible?0.7:1}}>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:4,textTransform:"uppercase",background:t.status==="active"?C.greenBg:C.purpleBg,color:t.status==="active"?C.green:C.purple}}>{t.status}</span>
          <span style={{fontSize:12,color:C.gray400}}>{t.course}</span>
          {t.category==="crash"&&<span style={{fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:4,background:"#FEE2E2",color:"#DC2626"}}>🚀 CRASH</span>}
          {t.category==="paid"&&!t.free&&<span style={{fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:4,background:"#FEF3C7",color:"#D97706"}}>👑 PREMIUM</span>}
        </div>
        <h3 style={{fontSize:15,fontWeight:600,color:C.gray800,margin:0}}>{t.name}</h3>
        <p style={{fontSize:13,color:C.gray400,marginTop:4}}>{t.qs} Questions · {t.dur} · {t.date}</p>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <span style={{fontSize:16,fontWeight:800,color:t.free?C.green:C.orange}}>{t.free?"FREE":`₹${t.price}`}</span>
        {!accessible?<Btn onClick={()=>setShowPlans(true)} variant="outline" style={{padding:"8px 18px",fontSize:12,borderColor:"#D97706",color:"#D97706"}}>🔒 Upgrade</Btn>:
        t.status==="active"?<Btn onClick={()=>onLaunchTest(t)} variant="success" style={{padding:"8px 18px",fontSize:13}} icon={Icon.arrow(14)}>Launch</Btn>:
        <Btn variant="ghost" disabled style={{padding:"8px 18px",fontSize:13}}>Upcoming</Btn>}
      </div>
    </Card>
  );};

  return (
    <div style={{minHeight:"100vh",background:C.bg}}><NavBar />
      <div style={{maxWidth:880,margin:"0 auto",padding:"28px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div><h1 style={{fontSize:22,fontWeight:800,color:C.gray900,marginBottom:4}}>Student Dashboard</h1>
            <p style={{color:C.gray500,fontSize:14}}>{student.name} · Class {student.class} · {student.course}
              <span onClick={()=>setShowPlans(true)} style={{marginLeft:8,padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:700,cursor:"pointer",background:student.plan==="free"?C.gray100:student.plan==="premium"?"#FEF3C7":"#FEE2E2",color:student.plan==="free"?C.gray500:student.plan==="premium"?"#D97706":"#DC2626"}}>{student.plan==="free"?"🆓 Free":student.plan==="premium"?"👑 Premium":"🚀 Crash"}</span></p>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={onPragati} variant="primary" style={{background:"linear-gradient(135deg,#0E1B2E,#1E3A5F)",padding:"10px 20px",borderRadius:12,fontSize:13}}>✨ प्रगति — Pragati</Btn>
            {student.plan==="free"&&<Btn onClick={()=>setShowPlans(true)} style={{background:"linear-gradient(135deg,#D97706,#B45309)",padding:"10px 20px",borderRadius:12,fontSize:13,color:"#fff"}}>👑 Upgrade</Btn>}
          </div>
        </div>
        {student.plan==="free"&&<Card style={{padding:"12px 20px",marginBottom:16,background:"linear-gradient(135deg,#0E1B2E,#1E3A5F)",border:"none"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:14,fontWeight:600,color:"#fff"}}>✨ Pragati — 1 free topic per subject</div><p style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginTop:2}}>Upgrade to Premium to unlock all topics</p></div><Btn onClick={()=>setShowPlans(true)} style={{background:"#D97706",padding:"8px 16px",borderRadius:8,fontSize:12,color:"#fff",flexShrink:0}}>Unlock All ₹499</Btn></div></Card>}

        <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:`2px solid ${C.gray200}`}}>
          {[{id:"available",label:"Free Tests",count:freeTests.length},{id:"paid",label:"👑 Premium",count:paidTests.length},{id:"crash",label:"🚀 Crash",count:crashTests.length},{id:"results",label:"My Results",count:pastTests.length}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"12px 16px",fontSize:13,fontWeight:600,cursor:"pointer",border:"none",background:"transparent",color:tab===t.id?C.primary:C.gray500,borderBottom:tab===t.id?`2.5px solid ${C.primary}`:"2.5px solid transparent",marginBottom:-2}}>{t.label}<span style={{background:tab===t.id?C.blue50:C.gray100,color:tab===t.id?C.primary:C.gray500,fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:10}}>{t.count}</span></button>
          ))}
        </div>

        {tab==="available"&&<div style={{display:"grid",gap:12}}>{freeTests.length===0?<Card style={{textAlign:"center",padding:40,color:C.gray400}}>No free tests for Class {student.class}</Card>:freeTests.map(t=><TestCard key={t.id} t={t}/>)}</div>}
        {tab==="paid"&&<div style={{display:"grid",gap:12}}>{paidTests.map(t=><TestCard key={t.id} t={t}/>)}</div>}
        {tab==="crash"&&<div style={{display:"grid",gap:12}}>{crashTests.map(t=><TestCard key={t.id} t={t}/>)}</div>}
        {tab==="results"&&(pastTests.length===0?<Card style={{textAlign:"center",padding:"60px 24px"}}><div style={{fontSize:48,marginBottom:16}}>📝</div><h3 style={{fontSize:18,fontWeight:700,color:C.gray700}}>No tests taken yet</h3><Btn onClick={()=>setTab("available")} style={{marginTop:16}}>Browse Tests</Btn></Card>:
          <div style={{display:"grid",gap:12}}>{[...pastTests].reverse().map((pt,idx)=>{const pct=pt.total>0?Math.round((pt.correct/pt.total)*100):0;return(
            <Card key={idx} style={{padding:"20px 24px",cursor:"pointer"}} onClick={()=>onViewResult(pt)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><h3 style={{fontSize:15,fontWeight:600,color:C.gray800,margin:0}}>{pt.testName}</h3><p style={{fontSize:13,color:C.gray400,marginTop:4}}>{pt.date}</p>
                  <div style={{display:"flex",gap:16,marginTop:10}}>{[{l:"Correct",v:pt.correct,c:C.green},{l:"Wrong",v:pt.wrong,c:C.red},{l:"Skipped",v:pt.unanswered,c:C.gray500}].map(s=><div key={s.l} style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:14,fontWeight:800,color:s.c}}>{s.v}</span><span style={{fontSize:11,color:C.gray400}}>{s.l}</span></div>)}</div>
                </div>
                <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:800,color:pct>=60?C.green:pct>=30?C.orange:C.red}}>{pct}%</div><span style={{fontSize:13,fontWeight:700,color:C.gray700}}>{pt.correct}/{pt.total}</span></div>
              </div>
            </Card>
          );})}</div>
        )}
      </div>

      {showPlans&&<div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",padding:20}} onClick={()=>!paymentProcessing&&setShowPlans(false)}>
        <div style={{background:"#fff",borderRadius:20,padding:"32px 28px",maxWidth:780,width:"100%",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}><div style={{textAlign:"center",flex:1}}><h2 style={{fontSize:22,fontWeight:800,margin:0}}>Choose Your Plan</h2><p style={{color:C.gray500,fontSize:14,marginTop:6}}>Unlock tests, Pragati, and crash courses</p></div><button onClick={()=>setShowPlans(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:C.gray400}}>✕</button></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
            {PLANS.map(plan=>(<div key={plan.id} style={{borderRadius:14,border:`2px solid ${plan.current?plan.color:plan.popular?plan.color:C.gray200}`,padding:"24px 20px",position:"relative",background:plan.current?`${plan.color}08`:"#fff"}}>
              {plan.popular&&!plan.current&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",padding:"3px 14px",borderRadius:10,fontSize:10,fontWeight:700,background:plan.color,color:"#fff"}}>MOST POPULAR</div>}
              <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:32,marginBottom:8}}>{plan.icon}</div><h3 style={{fontSize:18,fontWeight:800,margin:0}}>{plan.name}</h3><div style={{marginTop:8}}><span style={{fontSize:28,fontWeight:800,color:plan.color}}>{plan.price===0?"Free":`₹${plan.price}`}</span>{plan.period&&<span style={{fontSize:13,color:C.gray400}}>{plan.period}</span>}</div></div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>{plan.features.map((f,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,fontSize:13,color:C.gray600}}><span style={{color:C.green,flexShrink:0}}>✓</span><span>{f}</span></div>))}</div>
              {plan.current?<div style={{textAlign:"center",padding:"10px",borderRadius:8,background:C.greenBg,color:C.green,fontWeight:700,fontSize:13}}>✓ Current Plan</div>:plan.price>0&&<Btn onClick={()=>handleBuyPlan(plan.id)} disabled={paymentProcessing} style={{width:"100%",justifyContent:"center",background:plan.color,color:"#fff",padding:"10px",borderRadius:8}}>{paymentProcessing?"Processing...":`Buy ${plan.name} — ₹${plan.price}`}</Btn>}
            </div>))}
          </div>
          <div style={{textAlign:"center",marginTop:20,fontSize:12,color:C.gray400}}>💳 Secure payment via Razorpay · Instant activation</div>
        </div>
      </div>}
    </div>
  );
}

// ═══ EXAM SCREEN ═══
function ExamScreen({ onSubmit, customQuestions, examConfig }) {
  const questions = customQuestions || ALL_QUESTIONS;
  const config = examConfig || { name:"CET Mock Test", duration:1800 };
  const sections = [...new Set(questions.map(q=>q.subject||q.section||q.chapter||"General"))];
  const hasSectionTimers = config.sectionTimers && config.sectionTimers.length > 0;
  const sectionDefs = hasSectionTimers ? config.sectionTimers : [{name:"All",subjects:sections,duration:config.duration}];

  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState(new Set());
  const [section, setSection] = useState(sections[0]);
  const [showSummary, setShowSummary] = useState(false);
  const [startTime] = useState(Date.now());
  const [lastVisit, setLastVisit] = useState(Date.now());
  const [visited, setVisited] = useState(new Set([0]));
  const [questionTimes, setQuestionTimes] = useState({});
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [lockedSections, setLockedSections] = useState([]);
  const [sectionSubmitted, setSectionSubmitted] = useState(false);

  const currentSectionDef = sectionDefs[activeSectionIdx]||sectionDefs[0];
  const sectionTimeLeft = useTimer(currentSectionDef.duration, !showSummary && !sectionSubmitted);
  const timeLeft = hasSectionTimers ? sectionTimeLeft : useTimer(config.duration, !showSummary);

  const isQuestionLocked = (i) => {
    if (!hasSectionTimers) return false;
    const qSub = questions[i].subject||questions[i].section||"General";
    return lockedSections.some(ls=>(ls.subjects||[]).includes(qSub));
  };

  useEffect(()=>{
    if(!hasSectionTimers||showSummary)return;
    if(sectionTimeLeft<=0&&activeSectionIdx<sectionDefs.length-1){
      setLockedSections(p=>[...p,currentSectionDef]);
      setActiveSectionIdx(activeSectionIdx+1);setSectionSubmitted(true);
      setTimeout(()=>setSectionSubmitted(false),100);
      const nextSec=sectionDefs[activeSectionIdx+1];
      const firstQ=questions.findIndex(q=>(nextSec.subjects||[]).includes(q.subject||"General"));
      if(firstQ>=0)navigate(firstQ);
    }else if(sectionTimeLeft<=0&&activeSectionIdx===sectionDefs.length-1)doSubmit();
  },[sectionTimeLeft]);

  const navigate=(i)=>{if(isQuestionLocked(i))return;const now=Date.now();setQuestionTimes(p=>({...p,[cur]:(p[cur]||0)+(now-lastVisit)/1000}));setLastVisit(now);setCur(i);setVisited(p=>new Set([...p,i]));setSection(questions[i].subject||questions[i].section||"General");};
  const doSubmit=()=>{const elapsed=Math.round((Date.now()-startTime)/1000);let correct=0,wrong=0,unanswered=0;questions.forEach((q,i)=>{if(answers[i]===undefined)unanswered++;else if(answers[i]===q.correct)correct++;else wrong++;});onSubmit({correct,wrong,unanswered,total:questions.length,answers,questions,elapsed,testName:config.name,date:new Date().toLocaleDateString("en-IN"),time:new Date().toLocaleTimeString("en-IN"),course:"CET-PCM",questionTimes});};

  if(timeLeft<=0&&!showSummary)doSubmit();

  const getStatus=(i)=>{if(answers[i]!==undefined&&marked.has(i))return{bg:"#7c3aed",color:"#fff",shape:"circle-ring"};if(answers[i]!==undefined)return{bg:C.green,color:"#fff",shape:"circle"};if(marked.has(i))return{bg:C.purple,color:"#fff",shape:"default"};if(visited.has(i))return{bg:C.red,color:"#fff",shape:"default"};return{bg:C.gray200,color:C.gray600,shape:"default"};};
  const q=questions[cur];

  if(showSummary)return(
    <div style={{minHeight:"100vh",background:C.bg,padding:40}}><Card style={{maxWidth:600,margin:"0 auto",padding:32}}>
      <h2 style={{fontSize:20,fontWeight:800,marginBottom:20,textAlign:"center"}}>Submit Exam?</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {[{l:"Answered",v:Object.keys(answers).length,c:C.green},{l:"Marked",v:marked.size,c:C.purple},{l:"Not Visited",v:questions.length-visited.size,c:C.gray400},{l:"Total",v:questions.length,c:C.primary}].map(s=><div key={s.l} style={{textAlign:"center",padding:12,borderRadius:8,background:C.gray50}}><div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:C.gray500}}>{s.l}</div></div>)}
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"center"}}><Btn variant="ghost" onClick={()=>setShowSummary(false)}>← Back to Exam</Btn><Btn variant="success" onClick={doSubmit}>✓ Submit Exam</Btn></div>
    </Card></div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:"#fff",borderBottom:`1px solid ${C.gray200}`,padding:"10px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><h2 style={{fontSize:16,fontWeight:700,margin:0,color:C.gray800}}>{config.name}</h2>
          <div style={{display:"flex",gap:2,background:C.gray100,borderRadius:6,padding:2}}>
            {sections.map(sub=>{const isLocked=hasSectionTimers&&lockedSections.some(ls=>(ls.subjects||[]).includes(sub));return(
              <button key={sub} onClick={()=>{if(isLocked)return;setSection(sub);navigate(questions.findIndex(q=>(q.subject||"General")===sub));}} style={{padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:600,cursor:isLocked?"not-allowed":"pointer",border:"none",background:section===sub?C.primary:"transparent",color:section===sub?"#fff":isLocked?C.gray300:C.gray500,opacity:isLocked?0.5:1}}>{isLocked?"🔒 ":""}{sub}</button>
            );})}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {hasSectionTimers&&<span style={{fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:6,background:"#f0fdf4",color:"#166534"}}>Section {activeSectionIdx+1}/{sectionDefs.length}</span>}
          <div style={{padding:"8px 16px",borderRadius:8,fontWeight:700,fontSize:16,fontFamily:"monospace",background:timeLeft<300?C.redBg:C.blue50,color:timeLeft<300?C.red:C.primary}}>{fmtTime(timeLeft)}</div>
        </div>
      </div>
      <div style={{display:"flex",maxWidth:1100,margin:"0 auto",gap:0,minHeight:"calc(100vh - 57px)"}}>
        <div style={{flex:1,padding:"24px 28px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <span style={{fontSize:14,color:C.gray500}}>Question {cur+1} of {questions.length}</span>
            <span style={{fontSize:12,color:C.gray400,background:C.gray100,padding:"4px 10px",borderRadius:4}}>{q.subject||section} · {q.chapter||""}</span>
          </div>
          <Card style={{marginBottom:20,padding:"24px 28px",borderLeft:`4px solid ${C.primary}`}}>
            <p style={{fontSize:16,fontWeight:600,color:C.gray800,lineHeight:1.6}}>Q{cur+1}. {q.q||q.question_text}</p>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
            {(q.options||[q.option_a,q.option_b,q.option_c,q.option_d]).map((opt,oi)=>{const sel=answers[cur]===oi;return(
              <div key={oi} onClick={()=>setAnswers({...answers,[cur]:oi})} style={{padding:"14px 18px",borderRadius:10,border:`2px solid ${sel?C.primary:C.gray200}`,background:sel?C.blue50:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                <span style={{width:28,height:28,borderRadius:"50%",background:sel?C.primary:C.gray100,color:sel?"#fff":C.gray600,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13}}>{String.fromCharCode(65+oi)}</span>
                <span style={{fontSize:14,color:sel?C.primary:C.gray700}}>{opt}</span>
              </div>
            );})}
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div style={{display:"flex",gap:8}}><Btn variant="ghost" onClick={()=>cur>0&&navigate(cur-1)} disabled={cur===0}>← Previous</Btn><Btn variant="ghost" onClick={()=>{setMarked(p=>{const n=new Set(p);if(n.has(cur))n.delete(cur);else n.add(cur);return n;})}}>{marked.has(cur)?"★ Unmark":"☆ Mark"}</Btn>{answers[cur]!==undefined&&<Btn variant="ghost" onClick={()=>{const n={...answers};delete n[cur];setAnswers(n);}}>Clear</Btn>}</div>
            <div style={{display:"flex",gap:8}}>{cur<questions.length-1?<Btn onClick={()=>navigate(cur+1)}>Next →</Btn>:<Btn variant="success" onClick={()=>setShowSummary(true)}>Submit Exam</Btn>}</div>
          </div>
        </div>
        <div style={{width:240,borderLeft:`1px solid ${C.gray200}`,padding:"20px 16px",background:"#fff"}}>
          <h3 style={{fontSize:13,fontWeight:700,color:C.gray700,marginBottom:12}}>PALETTE</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:20}}>
            {questions.map((_,i)=>{const s=getStatus(i);const locked=isQuestionLocked(i);return(
              <div key={i} onClick={()=>{if(!locked)navigate(i);}} style={{width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:locked?"not-allowed":"pointer",borderRadius:s.shape==="circle"||s.shape==="circle-ring"?"50%":8,background:s.bg,color:s.color,fontSize:12,fontWeight:700,opacity:locked?0.3:1,outline:i===cur?`2.5px solid ${C.primary}`:"none",outlineOffset:1}}>{i+1}</div>
            );})}
          </div>
          <h3 style={{fontSize:13,fontWeight:700,color:C.gray700,marginBottom:8}}>LEGEND</h3>
          {[{bg:C.green,c:"#fff",l:"Answered"},{bg:C.red,c:"#fff",l:"Not Answered"},{bg:C.gray200,c:C.gray600,l:"Not Visited"},{bg:C.purple,c:"#fff",l:"Marked for Review"}].map(s=>(
            <div key={s.l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:20,height:20,borderRadius:4,background:s.bg,border:`1px solid ${s.bg}`}}></div><span style={{fontSize:12,color:C.gray600}}>{s.l}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ RESULTS ═══
function Results({ result, onRestart, isNewSubmission, isPragati }) {
  const { correct, wrong, unanswered, total, answers, questions, elapsed, testName } = result;
  const score = correct; const pct = total > 0 ? Math.round((correct/total)*100) : 0;
  const accuracy = (correct+wrong)>0 ? Math.round((correct/(correct+wrong))*100) : 0;
  const [tab, setTab] = useState("summary");

  const subjectStats = useMemo(()=>{const m={};questions.forEach((q,i)=>{const sub=q.subject||q.section||"General";if(!m[sub])m[sub]={subject:sub,total:0,correct:0,wrong:0,unanswered:0};m[sub].total++;if(answers[i]===undefined)m[sub].unanswered++;else if(answers[i]===q.correct)m[sub].correct++;else m[sub].wrong++;});return Object.values(m);},[questions,answers]);

  const chapterStats = {};
  questions.forEach((q,i)=>{const ch=q.chapter||"General";const sub=q.subject||"General";if(!chapterStats[ch])chapterStats[ch]={total:0,correct:0,wrong:0,unanswered:0,subject:sub};chapterStats[ch].total++;if(answers[i]===undefined)chapterStats[ch].unanswered++;else if(answers[i]===q.correct)chapterStats[ch].correct++;else chapterStats[ch].wrong++;});

  const subjectRows = subjectStats.map(s=>{const sp=s.total>0?Math.round((s.correct/s.total)*100):0;const sa=(s.correct+s.wrong)>0?Math.round((s.correct/(s.correct+s.wrong))*100):0;return`<tr><td style="padding:10px 14px;font-weight:600">${s.subject}</td><td style="text-align:center">${s.total}</td><td style="text-align:center">${s.correct+s.wrong}</td><td style="text-align:center;color:#16a34a;font-weight:700">${s.correct}</td><td style="text-align:center;color:#dc2626">${s.wrong}</td><td style="text-align:center;font-weight:700;color:${sp>=60?"#16a34a":"#ea580c"}">${sp}%</td><td style="text-align:center">${sa}%</td></tr>`;}).join("");

  const downloadPDF = () => {
    const scoreDonut = `<svg width="140" height="140" viewBox="0 0 140 140" style="display:block;margin:0 auto 10px"><circle cx="70" cy="70" r="56" fill="none" stroke="#e5e7eb" stroke-width="14"/><circle cx="70" cy="70" r="56" fill="none" stroke="${pct>=60?"#16a34a":pct>=30?"#ea580c":"#dc2626"}" stroke-width="14" stroke-dasharray="${2*Math.PI*56*pct/100} ${2*Math.PI*56*(1-pct/100)}" transform="rotate(-90 70 70)" stroke-linecap="round"/><text x="70" y="64" text-anchor="middle" font-size="28" font-weight="900" fill="#1f2937">${pct}%</text><text x="70" y="84" text-anchor="middle" font-size="12" fill="#6b7280">${score}/${total}</text></svg>`;
    const subjectDonuts = subjectStats.map(s=>{const sp=s.total>0?Math.round((s.correct/s.total)*100):0;return`<div style="text-align:center;flex:1"><svg width="90" height="90" viewBox="0 0 90 90" style="display:block;margin:0 auto 6px"><circle cx="45" cy="45" r="36" fill="none" stroke="#e5e7eb" stroke-width="9"/><circle cx="45" cy="45" r="36" fill="none" stroke="${sp>=60?"#16a34a":sp>=30?"#ea580c":"#dc2626"}" stroke-width="9" stroke-dasharray="${2*Math.PI*36*sp/100} ${2*Math.PI*36*(1-sp/100)}" transform="rotate(-90 45 45)" stroke-linecap="round"/><text x="45" y="48" text-anchor="middle" font-size="18" font-weight="800" fill="#1f2937">${sp}%</text></svg><div style="font-size:14px;font-weight:700">${s.subject}</div><div style="font-size:11px;color:#6b7280">${s.correct}/${s.total}</div></div>`;}).join("");
    const chapterBars = Object.entries(chapterStats).map(([ch,s])=>{const cp=Math.round((s.correct/s.total)*100);return`<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-weight:600">${ch} <span style="color:#9ca3af;font-size:11px">(${s.subject})</span></span><span style="font-weight:700;color:${cp>=60?"#16a34a":"#dc2626"}">${cp}%</span></div><div style="height:10px;border-radius:5px;background:#e5e7eb;overflow:hidden"><div style="height:100%;border-radius:5px;background:${cp>=60?"#16a34a":"#dc2626"};width:${cp}%"></div></div><div style="font-size:10px;color:#9ca3af">✓${s.correct} ✗${s.wrong} — ${s.unanswered} skipped</div></div>`;}).join("");

    const html = `<!DOCTYPE html><html><head><title>Test Report</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:sans-serif;padding:40px;color:#1f2937}h2{font-size:18px;margin:28px 0 14px;border-bottom:2px solid #2563eb;padding-bottom:6px}.row{display:flex;gap:16px;margin-bottom:24px}.sc{flex:1;border:1px solid #e5e7eb;border-radius:10px;padding:16px;text-align:center}.sc .n{font-size:26px;font-weight:800}.sc .l{font-size:12px;color:#6b7280}table{width:100%;border-collapse:collapse;font-size:14px}thead tr{background:#f3f4f6}th{padding:10px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase}tbody tr{border-bottom:1px solid #f3f4f6}@media print{body{padding:20px}}</style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #2563eb;padding-bottom:16px;margin-bottom:20px"><img src="${LOGO_BASE64}" style="height:52px"/><div style="text-align:right"><h1 style="font-size:20px;font-weight:800">Test Report Card</h1><p style="font-size:12px;color:#6b7280">${result.pragatiInfo?result.pragatiInfo.topicName+" · "+result.pragatiInfo.level+" · ":""}${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</p></div></div>
    <h2>Score Summary</h2>${scoreDonut}<div class="row"><div class="sc"><div class="n" style="color:#16a34a">${correct}</div><div class="l">Correct</div></div><div class="sc"><div class="n" style="color:#dc2626">${wrong}</div><div class="l">Incorrect</div></div><div class="sc"><div class="n" style="color:#6b7280">${unanswered}</div><div class="l">Skipped</div></div><div class="sc"><div class="n" style="color:#2563eb">${total}</div><div class="l">Total</div></div></div>
    <h2>Subject Analysis</h2><div style="display:flex;gap:16px;justify-content:center;margin-bottom:16px">${subjectDonuts}</div><table><thead><tr><th>Subject</th><th style="text-align:center">Total</th><th style="text-align:center">Attempted</th><th style="text-align:center">Correct</th><th style="text-align:center">Incorrect</th><th style="text-align:center">Score</th><th style="text-align:center">Accuracy</th></tr></thead><tbody>${subjectRows}</tbody></table>
    <h2>Chapter Analysis</h2>${chapterBars}
    <div style="margin-top:32px;padding:16px 0;border-top:2px solid #e5e7eb;display:flex;justify-content:space-between"><img src="${LOGO_BASE64}" style="height:30px;opacity:0.7"/><div style="color:#9ca3af;font-size:11px;text-align:right">GR Educational · Test Report · ${new Date().getFullYear()}</div></div>
    <script>window.onload=function(){window.print()}<\/script></body></html>`;
    const w = window.open("","_blank"); w.document.write(html); w.document.close();
  };

  const DonutChart = ({value,size=100,stroke=12,color}) => {
    const r=(size-stroke)/2;const circ=2*Math.PI*r;const dash=circ*value/100;
    return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.gray200} strokeWidth={stroke}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color||C.primary} strokeWidth={stroke} strokeDasharray={`${dash} ${circ-dash}`} transform={`rotate(-90 ${size/2} ${size/2})`} strokeLinecap="round" style={{transition:"stroke-dasharray 0.6s"}}/><text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle" style={{fontSize:size*0.22,fontWeight:800,fill:C.gray800}}>{value}%</text></svg>);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg}}><NavBar/>
      <div style={{maxWidth:900,margin:"0 auto",padding:"28px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div><h1 style={{fontSize:22,fontWeight:800}}>Test Results{result.pragatiInfo?` — ${result.pragatiInfo.topicName} · ⚡ ${result.pragatiInfo.level}`:""}</h1></div>
          <Btn onClick={downloadPDF} variant="outline" icon={Icon.download()}>Download PDF</Btn>
        </div>
        <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:`2px solid ${C.gray200}`}}>
          {[{id:"summary",l:"📊 Score Summary"},{id:"subject",l:"📚 Subject Analysis"},{id:"chapter",l:"📖 Chapter Analysis"},{id:"question",l:"📝 Question-wise"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"12px 16px",fontSize:13,fontWeight:600,border:"none",background:"transparent",cursor:"pointer",color:tab===t.id?C.primary:C.gray500,borderBottom:tab===t.id?`2.5px solid ${C.primary}`:"2.5px solid transparent",marginBottom:-2}}>{t.l}</button>
          ))}
        </div>

        {tab==="summary"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Card style={{textAlign:"center",padding:24}}><DonutChart value={pct} size={140} stroke={14} color={pct>=60?C.green:pct>=30?C.orange:C.red}/><div style={{marginTop:10,fontSize:18,fontWeight:800,color:C.gray800}}>{score}/{total}</div><div style={{fontSize:13,color:C.gray500}}>{pct>=70?"🏆 Excellent":pct>=40?"⚡ Good":"📖 Needs Improvement"}</div></Card>
          <Card style={{padding:24}}><h3 style={{fontSize:15,fontWeight:700,marginBottom:16}}>Performance</h3>{[{l:"Correct",v:correct,c:C.green},{l:"Incorrect",v:wrong,c:C.red},{l:"Unattempted",v:unanswered,c:C.gray400},{l:"Accuracy",v:`${accuracy}%`,c:C.primary},{l:"Time",v:`${Math.round(elapsed/60)}m ${elapsed%60}s`,c:C.gray600}].map(m=>(<div key={m.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.gray100}`}}><span style={{color:C.gray500}}>{m.l}</span><strong style={{color:m.c}}>{m.v}</strong></div>))}</Card>
        </div>}

        {tab==="subject"&&<Card style={{padding:24}}><h3 style={{fontSize:16,fontWeight:700,marginBottom:24}}>Subject-wise Comparison</h3>
          <div style={{display:"flex",gap:24,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>{subjectStats.map(s=>{const sp=s.total>0?Math.round((s.correct/s.total)*100):0;return(<div key={s.subject} style={{textAlign:"center"}}><DonutChart value={sp} size={100} stroke={10} color={sp>=60?C.green:sp>=30?C.orange:C.red}/><div style={{fontSize:14,fontWeight:700,marginTop:6}}>{s.subject}</div><div style={{fontSize:12,color:C.gray500}}>{s.correct}/{s.total}</div></div>);})}</div>
        </Card>}

        {tab==="chapter"&&<Card style={{padding:24}}><h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Chapter-wise Breakdown</h3>
          {Object.entries(chapterStats).map(([ch,s])=>{const cp=s.total>0?Math.round((s.correct/s.total)*100):0;return(<div key={ch} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontWeight:700}}>{ch} <span style={{fontSize:12,color:C.gray400}}>{s.subject}</span></span><span style={{fontWeight:800,color:cp>=60?C.green:C.orange}}>{cp}%</span></div>
            <div style={{height:8,borderRadius:4,background:C.gray200,overflow:"hidden"}}><div style={{height:"100%",borderRadius:4,background:cp>=60?C.green:cp>=30?C.orange:C.red,width:`${cp}%`}}/></div>
            <div style={{fontSize:11,color:C.gray400,marginTop:2}}>✓ {s.correct}  ✗ {s.wrong}  — {s.unanswered} skipped  ·  {s.correct}/{s.total}</div>
          </div>);})}
        </Card>}

        {tab==="question"&&<Card style={{padding:24}}><h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Question-wise Review</h3>
          {questions.map((q,i)=>{const userAns=answers[i];const isCorrect=userAns===q.correct;const isSkipped=userAns===undefined;return(
            <div key={i} style={{padding:"12px 16px",borderBottom:`1px solid ${C.gray100}`,display:"flex",gap:12,alignItems:"flex-start"}}>
              <span style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0,background:isSkipped?C.gray100:isCorrect?C.greenBg:C.redBg,color:isSkipped?C.gray400:isCorrect?C.green:C.red}}>{isSkipped?"—":isCorrect?"✓":"✗"}</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.gray700}}>Q{i+1}. {q.q||q.question_text}</div><div style={{fontSize:12,color:C.gray500,marginTop:4}}>{q.subject} · {q.chapter}</div>
                {!isSkipped&&!isCorrect&&<div style={{fontSize:12,marginTop:4}}><span style={{color:C.red}}>Your: {String.fromCharCode(65+userAns)}</span> · <span style={{color:C.green}}>Correct: {String.fromCharCode(65+q.correct)}</span></div>}
                {q.solution&&<div style={{fontSize:12,color:C.primary,marginTop:4,padding:"4px 8px",background:C.blue50,borderRadius:4}}>💡 {q.solution}</div>}
              </div>
            </div>
          );})}
        </Card>}

        <div style={{textAlign:"center",marginTop:20}}><Btn onClick={onRestart} variant="primary">← Back to Dashboard</Btn></div>
      </div>
    </div>
  );
}
