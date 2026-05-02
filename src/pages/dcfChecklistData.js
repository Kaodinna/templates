export const STORAGE_KEY = 'compleros-template-dcf-license-checklist';

export const TEMPLATE = {
  id: 'dcf-license-checklist',
  docId: 'CMP-TMP-DCF-001',
  eyebrow: 'Licensing & Application Template',
  title: 'DCF Facility License Application Checklist',
  intro: 'Work through each section before submitting your application to the Florida Department of Children and Families (DCF). Every item maps to a requirement under Chapter 402, F.S., Rule 65C-22, F.A.C., and the CF-FSP 5017 application form. Check items off as you assemble your application package — a complete submission moves faster through DCF review.',
  programInfo: [
    { id:'programName',    label:'Program Name (as it will appear on license)', full:true },
    { id:'applicationType',label:'Application Type (Initial / Renewal / Change of Ownership)' },
    { id:'licenseNumber',  label:'License Number (renewals only)' },
    { id:'physicalAddress',label:'Physical Address of Facility', full:true },
    { id:'county',         label:'County' },
    { id:'maxCapacity',    label:'Maximum Capacity' },
    { id:'ownershipType',  label:'Ownership Type' },
    { id:'directorName',   label:'Director / Owner Name' },
    { id:'targetDate',     label:'Target Submission Date', type:'date' },
  ],
  sections: [
    { id:'s1', num:1, title:'Application Forms, Fees & Program Details', intro:'Core application documents required for CF-FSP 5017. Maps to Parts 1 and 2 of the DCF form.', items:[
      { id:'1-1', label:'CF-FSP Form 5017 — completed in blue or black ink, no white-out', note:'Download from myflfamilies.com — signed and dated by owner, director, or designated representative' },
      { id:'1-2', label:'Annual license fee payment', note:'Check or money order payable to the Department of Children and Families' },
      { id:'1-3', label:'Federal Employer Identification Number (EIN) documentation' },
      { id:'1-4', label:'Maximum capacity determined and entered on application', note:'Based on indoor square footage per F.A.C. 65C-22.002(1) — 35 sq. ft. per child' },
      { id:'1-5', label:'Program designations selected (Faith Based, Head Start, VPK, School Readiness, etc.)', note:'Part 1 of CF-FSP 5017 — check all that apply to your program' },
      { id:'1-6', label:'Service options declared (Full Day, Before/After School, Infant Care, Transportation, etc.)', note:'Part 1 of CF-FSP 5017 — check all service types you will offer' },
      { id:'1-7', label:'Days, hours, and months of operation documented' },
      { id:'1-8', label:'For renewals: application submitted at least 45 days before license expiration', note:'Failure to submit 45 days prior is a licensing violation under Rule 65C-22.010(2)(c), F.A.C.' },
    ]},
    { id:'s2', num:2, title:'Ownership Documentation', intro:'Required documents depend on your ownership type. Complete the section that applies per Part 2 of CF-FSP 5017.', items:[
      { id:'2-1', label:'Individual Ownership — owner name, DOB, SSN, home address on form (Sections A + F)', note:'One owner only. Complete Section A on CF-FSP 5017.' },
      { id:'2-2', label:'Corporation — Articles of Incorporation with Board of Directors names and registered agent', note:'Initial: Articles of Incorporation. Renewal: current Certificate of Status from SunBiz.org.' },
      { id:'2-3', label:'LLC — Articles of Organization with member names and registered agent', note:'Initial: Articles of Organization. Renewal: current Certificate of Status from SunBiz.org.' },
      { id:'2-4', label:'Partnership — copy of Partnership Agreement (submit annually)', note:'Attach additional sheets if more than two partners. Complete Sections D + F.' },
      { id:'2-5', label:'Other Entity — entity name, designated representative, and entity address', note:'School Boards, municipalities, before/after school programs, faith-based orgs.' },
      { id:'2-6', label:'On-site Director information completed (Section F — required for all applicants)', note:'Director name, DOB, SSN, home address, credential, and cell phone number' },
      { id:'2-7', label:'If facility is in or adjacent to the owner/operator home: household member list attached', note:'All household members must complete Level 2 background screening' },
    ]},
    { id:'s3', num:3, title:'Facility & Premises', intro:'Documentation proving the physical location meets all state and local requirements.', items:[
      { id:'3-1', label:'Proof of ownership or current lease agreement', note:'Lease must cover the full license period' },
      { id:'3-2', label:'Floor plan of the facility', note:'Include square footage per room, indoor play space, and outdoor play area' },
      { id:'3-3', label:'Local zoning approval or compliance letter', note:'Obtain approval from local zoning and building code offices prior to submission' },
      { id:'3-4', label:'Current local fire inspection report', note:'Must be dated within the last 12 months and show satisfactory status' },
      { id:'3-5', label:'Current environmental / sanitation inspection report', note:'Issued by the county health department' },
      { id:'3-6', label:'Playground safety inspection (if applicable)' },
      { id:'3-7', label:'Water quality testing results (if on well water)' },
    ]},
    { id:'s4', num:4, title:'Staff & Personnel', intro:'Credentials, screenings, and training documentation for every staff member.', items:[
      { id:'4-1', label:'Director credential documentation', note:'Florida Director Credential or National Administrator Credential (NAC)' },
      { id:'4-2', label:'Level 2 background screening results — all staff', note:'Fingerprinting through the Clearinghouse; renewed every 5 years per s. 402.305(2), F.S.' },
      { id:'4-3', label:'Level 2 background screening — volunteers and household members (if applicable)' },
      { id:'4-4', label:'Proof of 45-hour DCF Introductory Child Care Training', note:'Or signed enrollment agreement within required timeframe' },
      { id:'4-5', label:'Staff emergency contact and health information forms' },
      { id:'4-6', label:'Staffing plan showing compliance with age-group ratios', note:'Refer to F.A.C. 65C-22.001(4) for required staff-to-child ratios' },
      { id:'4-7', label:'10-hour in-service training plan' },
      { id:'4-8', label:'Child enrichment service provider screening (if applicable)', note:'Per s. 402.3054, F.S. — Level 2 screening using Chapter 435 standards.' },
    ]},
    { id:'s5', num:5, title:'Health & Safety', intro:'Operating procedures that protect children while in your care.', items:[
      { id:'5-1', label:'Written emergency preparedness plan (fire, weather, lockdown)' },
      { id:'5-2', label:'Posted evacuation routes and emergency contact information' },
      { id:'5-3', label:'First aid supplies and posted CPR/first aid certifications' },
      { id:'5-4', label:'Written medication administration policy' },
      { id:'5-5', label:'Written discipline policy (must prohibit corporal punishment)' },
      { id:'5-6', label:'Written policy on the release of children (authorized pickup)' },
      { id:'5-7', label:'Documented daily health check procedures' },
      { id:'5-8', label:'Transportation safety plan (if transporting children)', note:'Includes vehicle inspection records and driver license/background verification' },
    ]},
    { id:'s6', num:6, title:'Enrollment & Records', intro:'Record-keeping systems and forms used for enrolled children.', items:[
      { id:'6-1', label:'Enrollment form template' },
      { id:'6-2', label:'Immunization record (DH Form 680) collection procedure', note:'Required before first day of attendance per F.S. 1003.22' },
      { id:'6-3', label:'Student health exam record (DH Form 3040) collection procedure' },
      { id:'6-4', label:'Emergency contact and authorized pickup form per child' },
      { id:'6-5', label:'Parental consent forms (photo, field trips, sunscreen, transportation)' },
      { id:'6-6', label:'Daily attendance tracking system' },
      { id:'6-7', label:'Incident/accident reporting form and log' },
    ]},
    { id:'s7', num:7, title:'Insurance & Financial', intro:'Financial and liability documentation required for operation.', items:[
      { id:'7-1', label:'Certificate of general liability insurance' },
      { id:'7-2', label:'Proof of vehicle insurance (if transporting children)' },
      { id:'7-3', label:"Workers' compensation coverage (if required by employee count)" },
      { id:'7-4', label:'Parent fee schedule and written enrollment agreement template' },
    ]},
    { id:'s8', num:8, title:'Attestations & Compliance Declarations', intro:'Signed declarations required in Part 3 of CF-FSP 5017. These are legal attestations — review each before signing.', items:[
      { id:'8-1', label:'Mandated reporter affidavit — all child care personnel comply with s. 39.201, F.S.', note:'Signed affidavit confirming all staff meet mandatory reporting requirements' },
      { id:'8-2', label:'Background screening attestation — compliance with Chapter 435, F.S.', note:'Signed under penalty of perjury confirming all personnel have completed required screenings' },
      { id:'8-3', label:'Rilya Wilson Act acknowledgment — receipt confirmed per s. 39.604, F.S.' },
      { id:'8-4', label:'HIPAA compliance acknowledgment', note:"Covers employee and children's health records in your possession" },
      { id:'8-5', label:'Disclosure: owner/applicant/director has never had a license denied, revoked, or suspended', note:'If yes, explanation must be attached.' },
      { id:'8-6', label:"Disclosure: prior licenses held with any state agency (other than driver's license)", note:'If yes, provide state, license type, number, and name used' },
      { id:'8-7', label:'Outstanding fines from prior licensing actions paid in full' },
    ]},
    { id:'s9', num:9, title:'Final Review Before Submission', intro:'Last-mile quality check before handing off to DCF.', items:[
      { id:'9-1', label:'All forms completed in blue or black ink — no white-out used', note:'Strikethroughs must be initialed. White-out will result in the application being returned.' },
      { id:'9-2', label:'All attestation pages signed and dated by applicant' },
      { id:'9-3', label:'Ownership-specific sections completed (only the section that applies)' },
      { id:'9-4', label:'Section F (On-site Director) completed regardless of ownership type' },
      { id:'9-5', label:'All supporting documents attached and organized' },
      { id:'9-6', label:'Copies made of the complete application package for internal records' },
      { id:'9-7', label:'Submission method confirmed (mail, in-person, or DCF online portal)' },
      { id:'9-8', label:'Licensing counselor contact information on file for follow-up', note:'DCF has 30 days to notify you of errors/omissions and 90 days to approve or deny.' },
    ]},
  ],
  callout: {
    eyebrow: 'Track this in Compleros',
    body: "Once your license is issued, add it to Compleros to monitor its renewal date, track staff credentials and background screenings against expiration, and stay ahead of every regulatory change affecting your program. Never wonder if you are compliant.",
  }
};

export const ALL_ITEMS = TEMPLATE.sections.flatMap(s => s.items);

export function emptyState() { return { programInfo:{}, checked:{}, notes:{} }; }

export function loadState() {
  try { const r = localStorage.getItem(STORAGE_KEY); if(r) return {...emptyState(),...JSON.parse(r)}; } catch(e){}
  return emptyState();
}

export function saveState(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch(e){} }

export function calcProgress(state) {
  const total = ALL_ITEMS.length;
  const done  = ALL_ITEMS.filter(i => state.checked[i.id]).length;
  return { done, total, pct: total ? Math.round((done/total)*100) : 0 };
}

export function sectionProgress(section, state) {
  const done = section.items.filter(i => state.checked[i.id]).length;
  return { done, total: section.items.length, complete: done === section.items.length };
}
