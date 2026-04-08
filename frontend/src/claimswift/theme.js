export const C = {
  navy: "#0f2342",
  navy2: "#14213d",
  navy3: "#1a2a4d",
  navy4: "#233358",
  teal: "#00a896",
  tealD: "#007d6e",
  tealL: "#e6f7f5",
  blue: "#3156d3",
  blueL: "#eef2fd",
  rose: "#c24d2c",
  roseL: "#fff3f1",
  amber: "#b7791f",
  amberL: "#fff8eb",
  green: "#1e7f5e",
  greenL: "#eaf7f2",
  text: "#1f2f4f",
  muted: "#7b879c",
  border: "#dbe4ef",
  bg: "#eef3f8",
  surface: "#ffffff",
  surfaceSoft: "#f6f8fc",
};

export const TONES = {
  teal: { bg: C.tealL, text: C.tealD, border: "rgba(0,168,150,0.3)" },
  blue: { bg: C.blueL, text: C.blue, border: "rgba(49,86,211,0.3)" },
  rose: { bg: C.roseL, text: C.rose, border: "rgba(194,77,44,0.3)" },
  amber: { bg: C.amberL, text: C.amber, border: "rgba(183,121,31,0.3)" },
  navy: { bg: "#f0f3f8", text: C.navy, border: "rgba(15,35,66,0.2)" },
  green: { bg: C.greenL, text: C.green, border: "rgba(30,127,94,0.3)" },
};

export const card = {
  background: C.surface,
  borderRadius: 20,
  border: `1px solid ${C.border}`,
  padding: "22px 24px",
};

export const css = (base, ...extra) => Object.assign({}, base, ...extra);
