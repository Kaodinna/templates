// Emergency Contact Form — field schema and PDF generation

export const STORAGE_KEY = 'compleros-template-emergency-contact-form';

export const FORM_SCHEMA = [
  {
    id: 'child', num: 1, title: "Child Information",
    fields: [
      { id:'childName',    label:"Child's Full Legal Name", col:6, type:'text',  required:true },
      { id:'preferredName',label:'Preferred Name',          col:3, type:'text',  hint:'Optional' },
      { id:'dob',          label:'Date of Birth',           col:3, type:'date',  required:true },
      { id:'gender',       label:'Gender',                  col:2, type:'text' },
      { id:'address',      label:'Home Address',            col:6, type:'text',  required:true },
      { id:'cityZip',      label:'City / Zip',              col:4, type:'text',  required:true },
      { id:'enrollDate',   label:'Enrollment Date',         col:3, type:'date' },
      { id:'classroom',    label:'Classroom / Age Group',   col:3, type:'text' },
      { id:'daysAttending',label:'Days Attending',          col:6, type:'text',  hint:'e.g., Mon–Fri' },
    ]
  },
  {
    id: 'parent1', num: 2, title: 'Parent / Guardian 1 (Primary)',
    fields: [
      { id:'p1Name',    label:'Full Name',                    col:4, type:'text',  required:true },
      { id:'p1Rel',     label:'Relationship',                 col:4, type:'text',  required:true },
      { id:'p1Dob',     label:'Date of Birth',                col:4, type:'date' },
      { id:'p1Addr',    label:'Home Address (if different)',   col:6, type:'text' },
      { id:'p1CityZip', label:'City / State / Zip',           col:6, type:'text' },
      { id:'p1Cell',    label:'Cell Phone',                   col:3, type:'tel',   required:true },
      { id:'p1Work',    label:'Work Phone',                   col:3, type:'tel' },
      { id:'p1Email',   label:'Email',                        col:6, type:'email', required:true },
      { id:'p1Employer',label:'Employer',                     col:4, type:'text' },
      { id:'p1EmpAddr', label:'Employer Address',             col:5, type:'text' },
      { id:'p1Hours',   label:'Work Hours',                   col:3, type:'text' },
    ]
  },
  {
    id: 'parent2', num: 3, title: 'Parent / Guardian 2',
    fields: [
      { id:'p2Name',  label:'Full Name',    col:4, type:'text' },
      { id:'p2Rel',   label:'Relationship', col:4, type:'text' },
      { id:'p2Dob',   label:'Date of Birth',col:4, type:'date' },
      { id:'p2Cell',  label:'Cell Phone',   col:4, type:'tel' },
      { id:'p2Work',  label:'Work Phone',   col:4, type:'tel' },
      { id:'p2Email', label:'Email',        col:4, type:'email' },
    ]
  },
  {
    id: 'emergency', num: 4, title: 'Emergency Contacts (other than parents)',
    groups: [
      { label:'Contact 1', fields:[{id:'ec1Name',label:'Full Name',col:4},{id:'ec1Rel',label:'Relationship',col:3},{id:'ec1Ph1',label:'Phone 1',col:3,type:'tel'},{id:'ec1Ph2',label:'Phone 2',col:2,type:'tel'}]},
      { label:'Contact 2', fields:[{id:'ec2Name',label:'Full Name',col:4},{id:'ec2Rel',label:'Relationship',col:3},{id:'ec2Ph1',label:'Phone 1',col:3,type:'tel'},{id:'ec2Ph2',label:'Phone 2',col:2,type:'tel'}]},
      { label:'Contact 3', fields:[{id:'ec3Name',label:'Full Name',col:4},{id:'ec3Rel',label:'Relationship',col:3},{id:'ec3Ph1',label:'Phone 1',col:3,type:'tel'},{id:'ec3Ph2',label:'Phone 2',col:2,type:'tel'}]},
    ]
  },
  {
    id: 'authorized', num: 5, title: 'Authorized Pickup Persons',
    hint: 'List all persons authorized to pick up this child other than parents above.',
    groups: [
      { label:'Person 1', fields:[{id:'ap1Name',label:'Name',col:4},{id:'ap1Rel',label:'Relationship',col:3},{id:'ap1Ph',label:'Phone',col:3,type:'tel'},{id:'ap1Id',label:'ID Type',col:2}]},
      { label:'Person 2', fields:[{id:'ap2Name',label:'Name',col:4},{id:'ap2Rel',label:'Relationship',col:3},{id:'ap2Ph',label:'Phone',col:3,type:'tel'},{id:'ap2Id',label:'ID Type',col:2}]},
      { label:'Person 3', fields:[{id:'ap3Name',label:'Name',col:4},{id:'ap3Rel',label:'Relationship',col:3},{id:'ap3Ph',label:'Phone',col:3,type:'tel'},{id:'ap3Id',label:'ID Type',col:2}]},
    ]
  },
  {
    id: 'restricted', num: 6, title: 'Custody Restrictions / Persons NOT Permitted to Pick Up',
    hint: 'If applicable — attach a copy of any court order.',
    groups: [
      { label:'', fields:[{id:'rp1Name',label:'Name',col:4},{id:'rp1Rel',label:'Relationship',col:3},{id:'rp1Reason',label:'Reason / Court Order #',col:5}]},
      { label:'', fields:[{id:'rp2Name',label:'Name',col:4},{id:'rp2Rel',label:'Relationship',col:3},{id:'rp2Reason',label:'Reason / Court Order #',col:5}]},
    ]
  },
  {
    id: 'notes', num: 7, title: 'Additional Notes or Special Instructions',
    fields: [
      { id:'additionalNotes', label:'', col:12, type:'textarea', hint:'Scheduling preferences, behavioral notes, preferred comforts, etc.' }
    ]
  },
];

export function loadState() {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    if (d) return JSON.parse(d);
  } catch (e) {}
  return {};
}

export function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

// ── Completion % ────────────────────────────────────────────
export function calcCompletion(state) {
  const required = [];
  FORM_SCHEMA.forEach(section => {
    (section.fields || []).forEach(f => { if (f.required) required.push(f.id); });
  });
  if (!required.length) return 0;
  const filled = required.filter(id => state[id] && String(state[id]).trim());
  return Math.round((filled.length / required.length) * 100);
}

// ── PDF generation via jsPDF drawing API ───────────────────
async function getJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
}

const NAVY = [27, 77, 107];
const GOLD = [196, 152, 90];
const LIGHT = [248, 246, 241];
const BORDER = [220, 215, 205];
const TEXT = [45, 55, 72];
const SUBTEXT = [100, 116, 139];

function val(state, id) {
  const v = state[id];
  if (!v || !String(v).trim()) return '';
  // format dates nicely
  if (String(v).match(/^\d{4}-\d{2}-\d{2}$/)) {
    const p = v.split('-');
    return `${p[1]}/${p[2]}/${p[0]}`;
  }
  return String(v);
}

export async function generateECPDF(state) {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  const PW = 216, PH = 279;
  const ML = 16, MR = 16, MT = 14;
  const CW = PW - ML - MR;
  let y = MT;

  // ── Header ───────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(ML, y, CW, 0.7, 'F');
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...NAVY);
  doc.text('Compleros', ML, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.text('FAMILY & ENROLLMENT TEMPLATE', ML, y + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text('Emergency Contact Form', ML + CW, y + 5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...SUBTEXT);
  const today = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  doc.text(`Generated ${today}`, ML + CW, y + 9.5, { align: 'right' });

  y += 14;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(ML, y, ML + CW, y);
  y += 5;

  // ── Helper: draw a section ────────────────────────────────
  function drawSection(title, num, fieldRows) {
    // Check if we need a new page (leave 30mm buffer)
    if (y + fieldRows.length * 12 + 16 > PH - 20) {
      doc.addPage();
      y = MT;
    }

    // Section label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.text(`${num}.`, ML, y + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text(title.toUpperCase(), ML + 5, y + 3.5);

    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(ML, y + 5.5, ML + CW, y + 5.5);
    y += 9;

    // Field rows
    fieldRows.forEach(row => {
      if (y + 12 > PH - 20) { doc.addPage(); y = MT; }

      if (row.type === 'group-label') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...SUBTEXT);
        doc.text(row.label.toUpperCase(), ML, y + 2.5);
        y += 5;
        return;
      }

      let x = ML;
      row.fields.forEach(f => {
        const fw = (f.col / 12) * CW - 2;
        // label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(...NAVY);
        doc.text(f.label || '', x, y + 2);
        // value or blank line
        const v = f.value || '';
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...TEXT);
        if (v) {
          doc.text(String(v), x, y + 7);
        }
        // underline
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.3);
        doc.line(x, y + 8.5, x + fw, y + 8.5);
        x += fw + 2;
      });
      y += 12;
    });

    y += 3;
  }

  // ── Render each section ──────────────────────────────────
  FORM_SCHEMA.forEach(section => {
    const rows = [];

    if (section.fields) {
      // Group into rows based on col spans summing to 12
      let currentRow = { fields: [], totalCol: 0 };
      section.fields.forEach(f => {
        const field = { ...f, value: val(state, f.id) };
        if (currentRow.totalCol + f.col > 12) {
          rows.push(currentRow);
          currentRow = { fields: [], totalCol: 0 };
        }
        currentRow.fields.push(field);
        currentRow.totalCol += f.col;
      });
      if (currentRow.fields.length) rows.push(currentRow);
    }

    if (section.groups) {
      section.groups.forEach(g => {
        if (g.label) rows.push({ type:'group-label', label: g.label });
        rows.push({
          fields: g.fields.map(f => ({ ...f, value: val(state, f.id) })),
        });
      });
    }

    drawSection(section.title, section.num, rows);
  });

  // ── Signature block ───────────────────────────────────────
  if (y + 35 > PH - 20) { doc.addPage(); y = MT; }
  y += 4;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(ML, y, ML + CW, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text('PARENT / GUARDIAN SIGNATURE', ML, y);
  y += 8;

  // Sig line 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...SUBTEXT);
  doc.text('Signature', ML, y);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(ML + 20, y + 0.5, ML + CW * 0.6, y + 0.5);
  doc.text('Date', ML + CW * 0.65, y);
  doc.line(ML + CW * 0.65 + 12, y + 0.5, ML + CW, y + 0.5);
  y += 10;

  doc.text('Printed Name', ML, y);
  doc.line(ML + 24, y + 0.5, ML + CW, y + 0.5);

  // ── Footer ────────────────────────────────────────────────
  const footY = PH - 14;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(ML, footY, ML + CW, footY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`CMP-TMP-ECF-001 · Generated ${today} · Compleros`, ML, footY + 4);
  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.text('compleros.com', ML + CW, footY + 4, { align: 'right' });

  doc.save(`Compleros_Emergency_Contact_${state.childName ? state.childName.replace(/\s+/g, '_') : 'Form'}_${new Date().toISOString().slice(0,10)}.pdf`);
}
