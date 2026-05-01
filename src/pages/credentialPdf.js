import { calcDateStatus, calcScreenExp, calcInService, fmtDate } from '../utils';

// Load jsPDF from CDN once
async function getJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
}

// ── Colours ───────────────────────────────────────────────────
const NAVY   = [27,  77, 107];
const GOLD   = [196, 152, 90];
const WHITE  = [255, 255, 255];
const LIGHT  = [248, 246, 241];
const BORDER = [220, 215, 205];

function statusColors(cls) {
  if (cls === 'current'  || cls === 'complete')      return { bg:[232,245,233], text:[46,125,50]   };
  if (cls === 'expiring' || cls === 'in-progress')   return { bg:[255,248,225], text:[180,83,9]    };
  if (cls === 'expired')                             return { bg:[254,226,226], text:[185,28,28]   };
  return                                                    { bg:[245,245,245], text:[158,158,158] };
}

function drawBadge(doc, cx, cy, label, cls) {
  if (!label || label === '—') return;
  const { bg, text } = statusColors(cls);
  const bw = 17, bh = 4, bx = cx - bw / 2, by = cy - bh / 2;
  doc.setFillColor(...bg);
  doc.roundedRect(bx, by, bw, bh, 1.5, 1.5, 'F');
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...text);
  doc.text(label, cx, cy + 1.4, { align: 'center' });
}

function trunc(doc, text, maxW) {
  if (!text || text === '—') return '—';
  const s = String(text);
  if (doc.getTextWidth(s) <= maxW) return s;
  let t = s;
  while (t.length > 1 && doc.getTextWidth(t + '…') > maxW) t = t.slice(0, -1);
  return t + '…';
}

// ── Column layout ─────────────────────────────────────────────
const COLS = [
  { label:'Staff Name',   w:26, type:'text-left'    },
  { label:'Role',         w:20, type:'text-left'    },
  { label:'Hire Date',    w:16, type:'text-center'  },
  { label:'Screen Date',  w:16, type:'text-center'  },
  { label:'Screen Exp.',  w:16, type:'text-center'  },
  { label:'Screen',       w:16, type:'badge'        },
  { label:'CPR Date',     w:16, type:'text-center'  },
  { label:'CPR Exp.',     w:16, type:'text-center'  },
  { label:'CPR',          w:15, type:'badge'        },
  { label:'FA Date',      w:16, type:'text-center'  },
  { label:'FA Exp.',      w:16, type:'text-center'  },
  { label:'FA',           w:15, type:'badge'        },
  { label:'45-Hr Done',   w:16, type:'text-center'  },
  { label:'IS Hrs',       w:11, type:'text-center'  },
  { label:'IS Status',    w:16, type:'badge'        },
  { label:'Dir.',         w:10, type:'text-center'  },
];

const GROUPS = [
  { label:'BASIC INFO',           span:3 },
  { label:'BACKGROUND SCREENING', span:3 },
  { label:'CPR CERTIFICATION',    span:3 },
  { label:'FIRST AID',            span:3 },
  { label:'45-HR TRAINING',       span:1 },
  { label:'ANNUAL IN-SERVICE',    span:2 },
  { label:'DIRECTOR',             span:1 },
];

// ── Main export ────────────────────────────────────────────────
export async function generatePDF(rows) {
  const filled = rows.filter(r => r.name.trim());
  if (!filled.length) {
    alert('Add at least one staff member with a name before downloading the PDF.');
    return;
  }

  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });

  const PW = 279, PH = 216;
  const ML = 8, MR = 8, MT = 10;
  const contentW = COLS.reduce((s, c) => s + c.w, 0); // should fit within PW - ML - MR

  // ── HEADER ───────────────────────────────────────────────
  doc.setFillColor(...GOLD);
  doc.rect(ML, MT, contentW, 0.7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...NAVY);
  doc.text('Compleros', ML, MT + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...GOLD);
  doc.text('COMPLIANCE MANAGEMENT FOR FLORIDA EDUCATION PROVIDERS', ML, MT + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text('Staff Credential Tracking Sheet', ML + contentW, MT + 8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  const today = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  doc.text(
    `Generated ${today}  ·  ${filled.length} staff member${filled.length !== 1 ? 's' : ''}`,
    ML + contentW, MT + 12, { align: 'right' }
  );

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(ML, MT + 15, ML + contentW, MT + 15);

  // ── GROUP HEADER ROW ─────────────────────────────────────
  const GH_H    = 4.5;
  const COL_H   = 6;
  const ROW_H   = 7.5;
  const tableTop = MT + 18;

  let gx = ML;
  let colIdx = 0;
  GROUPS.forEach(g => {
    const gw = COLS.slice(colIdx, colIdx + g.span).reduce((s, c) => s + c.w, 0);
    doc.setFillColor(...LIGHT);
    doc.rect(gx, tableTop, gw, GH_H, 'F');
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.2);
    doc.rect(gx, tableTop, gw, GH_H, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(...GOLD);
    doc.text(g.label, gx + gw / 2, tableTop + GH_H - 1.2, { align: 'center' });
    gx += gw;
    colIdx += g.span;
  });

  // ── COLUMN HEADER ROW ────────────────────────────────────
  const colTop = tableTop + GH_H;
  let cx = ML;
  COLS.forEach(col => {
    doc.setFillColor(...NAVY);
    doc.rect(cx, colTop, col.w, COL_H, 'F');
    doc.setDrawColor(19, 58, 82);
    doc.setLineWidth(0.15);
    doc.rect(cx, colTop, col.w, COL_H, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.2);
    doc.setTextColor(...WHITE);
    doc.text(col.label, cx + col.w / 2, colTop + COL_H - 1.8, { align: 'center' });
    cx += col.w;
  });

  // ── DATA ROWS ────────────────────────────────────────────
  const dataTop = colTop + COL_H;

  filled.forEach((r, idx) => {
    const rowY  = dataTop + idx * ROW_H;
    const rowBg = idx % 2 === 0 ? WHITE : LIGHT;

    // row background
    doc.setFillColor(...rowBg);
    doc.rect(ML, rowY, contentW, ROW_H, 'F');

    // bottom border
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.12);
    doc.line(ML, rowY + ROW_H, ML + contentW, rowY + ROW_H);

    // derived status
    const se   = calcScreenExp(r.screenDate);
    const ss   = calcDateStatus(se);
    const cs   = calcDateStatus(r.cprExp);
    const fs   = calcDateStatus(r.faExp);
    const isSt = calcInService(r.inServiceHrs);

    const cells = [
      { v: r.name || '—',            type:'text-left'   },
      { v: r.role || '—',            type:'text-left'   },
      { v: fmtDate(r.hireDate),      type:'text-center' },
      { v: fmtDate(r.screenDate),    type:'text-center' },
      { v: fmtDate(se),              type:'text-center' },
      { v: ss.label, cls: ss.cls,    type:'badge'       },
      { v: fmtDate(r.cprDate),       type:'text-center' },
      { v: fmtDate(r.cprExp),        type:'text-center' },
      { v: cs.label, cls: cs.cls,    type:'badge'       },
      { v: fmtDate(r.faDate),        type:'text-center' },
      { v: fmtDate(r.faExp),         type:'text-center' },
      { v: fs.label, cls: fs.cls,    type:'badge'       },
      { v: fmtDate(r.training45),    type:'text-center' },
      { v: r.inServiceHrs || '—',    type:'text-center' },
      { v: isSt.label, cls: isSt.cls,type:'badge'       },
      { v: r.dirCred === 'Y' ? 'Yes' : r.dirCred === 'N' ? 'No' : '—', type:'text-center' },
    ];

    const textY = rowY + ROW_H / 2 + 1.6;
    let cellX = ML;

    cells.forEach((cell, i) => {
      const col = COLS[i];
      const midX = cellX + col.w / 2;

      if (cell.type === 'badge') {
        drawBadge(doc, midX, rowY + ROW_H / 2, cell.v, cell.cls);
      } else if (cell.type === 'text-left') {
        doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(45, 55, 72);
        doc.text(trunc(doc, cell.v, col.w - 3), cellX + 2, textY);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(45, 55, 72);
        doc.text(cell.v || '—', midX, textY, { align: 'center' });
      }

      // vertical cell divider
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.1);
      doc.line(cellX + col.w, rowY, cellX + col.w, rowY + ROW_H);

      cellX += col.w;
    });
  });

  // ── LEGEND ───────────────────────────────────────────────
  const legendY = dataTop + filled.length * ROW_H + 5;
  doc.setFillColor(...LIGHT);
  doc.rect(ML, legendY, contentW, 7, 'F');
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.rect(ML, legendY, contentW, 7, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('LEGEND:', ML + 3, legendY + 4.5);

  [
    { label:'CURRENT',  cls:'current',  x: ML + 26 },
    { label:'EXPIRING', cls:'expiring', x: ML + 60 },
    { label:'EXPIRED',  cls:'expired',  x: ML + 97 },
  ].forEach(li => {
    drawBadge(doc, li.x, legendY + 3.5, li.label, li.cls);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    const desc = li.cls === 'current' ? '= Valid credential'
               : li.cls === 'expiring' ? '= Expires within 30 days'
               : '= Past expiry date';
    doc.text(desc, li.x + 11, legendY + 4.5);
  });

  // ── FOOTER ───────────────────────────────────────────────
  const footerY = legendY + 13;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(ML, footerY, ML + contentW, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('CMP-TMP-STF-001 · Auto-generated from Compleros Staff Credential Tracker', ML, footerY + 3.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GOLD);
  doc.text('compleros.com', ML + contentW, footerY + 3.5, { align: 'right' });

  // ── SAVE ─────────────────────────────────────────────────
  doc.save(`Compleros_Staff_Credentials_${new Date().toISOString().slice(0, 10)}.pdf`);
}
