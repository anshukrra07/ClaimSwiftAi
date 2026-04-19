import { C } from "../theme";

export default function GlobalStyles() {
  return (
    <style>{`
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:${C.text};background:${C.bg};line-height:1.5;-webkit-font-smoothing:antialiased}
      button{cursor:pointer;font:inherit;border:none;background:none}
      @keyframes riseIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      @keyframes screenIn{from{opacity:0;transform:translateY(8px) scale(.995)}to{opacity:1;transform:none}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
      @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      @keyframes celebrateBounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.04)}}
      @keyframes confettiFloat{0%{opacity:0;transform:translateY(18px) rotate(0deg)}20%{opacity:1}100%{opacity:0;transform:translateY(-38px) rotate(18deg)}}
      @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,168,150,.16)}50%{box-shadow:0 0 0 14px rgba(0,168,150,0)}}
      .screen-in{animation:screenIn 400ms cubic-bezier(.22,1,.36,1) both}
      .rise-in{animation:riseIn 500ms cubic-bezier(.22,1,.36,1) both}
      .pulse-dot{animation:pulse 1.4s ease infinite}
      .celebrate-bounce{animation:celebrateBounce 1.8s ease-in-out infinite}
      .glow-pulse{animation:glowPulse 2s ease-in-out infinite}
      .nav-btn{display:block;width:100%;text-align:left;padding:10px 12px;border-radius:12px;color:rgba(245,248,255,.72);font-size:.9rem;transition:all 160ms ease;border:1px solid transparent}
      .nav-btn:hover{color:#fff;background:rgba(49,86,211,.18);border-color:rgba(147,177,255,.16)}
      .nav-btn.active{color:#fff;background:rgba(49,86,211,.22);border-color:rgba(147,177,255,.22)}
      .mode-chip{padding:9px 16px;border-radius:999px;font-weight:700;font-size:.85rem;border:1px solid ${C.border};background:${C.surfaceSoft};color:${C.muted};transition:all 180ms ease}
      .mode-chip.active{background:linear-gradient(135deg,#17294d,#1d3461);color:#fff;border-color:transparent}
      .mode-chip:hover:not(.active){background:${C.border};color:${C.text}}
      .btn{padding:11px 20px;border-radius:14px;font-weight:700;font-size:.9rem;transition:all 160ms ease}
      .btn:hover{transform:translateY(-1px)}
      .btn:active{transform:scale(.97)}
      .btn-primary{background:${C.blue};color:#fff}
      .btn-primary:hover{background:#2545b8}
      .btn-secondary{background:${C.surfaceSoft};color:${C.text};border:1px solid ${C.border}}
      .btn-danger{background:${C.rose};color:#fff}
      .btn-ghost{background:transparent;color:${C.muted};border:1px solid ${C.border}}
      .btn-teal{background:${C.teal};color:#fff}
      .btn-full{width:100%}
      .rule-toggle{padding:14px 18px;border-radius:14px;border:1.5px solid ${C.border};background:${C.surface};cursor:pointer;text-align:left;width:100%;transition:all 180ms ease;display:flex;align-items:center;justify-content:space-between;gap:12px}
      .rule-toggle.on{border-color:rgba(0,168,150,.4);background:${C.tealL}}
      .rule-toggle.off{border-color:rgba(194,77,44,.3);background:${C.roseL}}
      .rule-toggle:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(15,35,66,.08)}
      input[type=range]{width:100%;accent-color:${C.teal}}
      ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.border};border-radius:99px}
    `}</style>
  );
}
