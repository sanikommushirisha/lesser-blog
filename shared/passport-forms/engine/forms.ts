// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport-forms/forms.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
/* eslint-disable */
// Verbatim port of the approved prototype; kept untyped on purpose (see packet.ts for the typed surface).
// @ts-nocheck
import * as LesserForms from "./fill-official";
import * as Typeset from "./typeset";

export const FORMS = (function () {
  function U(x) { return (x || '').toString().toUpperCase(); }
  function D(iso) { return LesserForms.fmtDate(iso); }
  function v(x, ph) { return { v: x || '', ph: ph }; }
  function addr(d) { return [d.street, d.apt, d.city, d.state, d.zip].filter(Boolean).join(', '); }
  function rel(d) { return d.relation || (d.gender === 'F' ? (d.married === 'yes' ? 'Wife of' : 'Daughter of') : 'Son of'); }
  function relName(d) { return rel(d) === 'Wife of' ? d.spouseName : d.fatherName; }
  function strike(all, keep) { return all.map(function (o, i) { return (i ? '/' : '') + o; }).map(function (o) { var w = o.replace('/', ''); return w === keep ? { b: o } : { s: o }; }); }
  function day(iso) { if (!iso) return ['', '']; var dt = new Date(iso + 'T12:00:00'); var n = dt.getDate(); var sfx = (n % 10 === 1 && n !== 11) ? 'st' : (n % 10 === 2 && n !== 12) ? 'nd' : (n % 10 === 3 && n !== 13) ? 'rd' : 'th'; return [n + sfx, dt.toLocaleString('en-US', { month: 'long' }) + ' ' + dt.getFullYear()]; }

  /* ---- shared field registry ---- */
  var STATES = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA PR RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');
  var FIELDS = {
    fullName: { l: 'Full name (given name then surname)', ac: 'name', help: 'Exactly as on your current passport. No commas.', req: 1, span: 1 },
    gender: { l: 'Gender', sel: [['M', 'Male'], ['F', 'Female'], ['X', 'Transgender']] },
    dob: { l: 'Date of birth', type: 'date', req: 1 },
    pob: { l: 'Place of birth (village/town/city)', ph: 'Pune', help: 'Not “India”. The portal allows 25 characters.', req: 1 },
    pobState: { l: 'State of birth', ph: 'Maharashtra' },
    passportNo: { l: 'Passport number', ph: 'Z4829137', req: 1, pat: /^[A-Za-z]\d{7}$/, patMsg: '1 letter and 7 digits, like Z4829137.' },
    issueDate: { l: 'Date of issue', type: 'date', req: 1 },
    expiry: { l: 'Date of expiry', type: 'date', req: 1 },
    issuePlace: { l: 'Place of issue', ph: 'Pune', req: 1 },
    fileNo: { l: 'File number', ph: 'On the last page of your passport', help: 'Printed on the last page, above your address.' },
    fatherName: { l: 'Father’s name', req: 1 },
    motherName: { l: 'Mother’s name', req: 1 },
    married: { l: 'Married?', sel: [['no', 'No'], ['yes', 'Yes']] },
    spouseName: { l: 'Spouse’s full name', req: function (d) { return d.married === 'yes'; } },
    relation: { l: 'On the forms, I am', sel: function (d) { var a = rel(d); return [['', a + ' (suggested)']].concat(['Son of', 'Daughter of', 'Wife of'].filter(function (r) { return r !== a; }).map(function (r) { return [r, r]; })); }, help: 'Wife of uses your spouse’s name; the others use your father’s.' },
    street: { l: 'US street address', ac: 'address-line1', req: 1, span: 1, help: 'No PO boxes.' },
    apt: { l: 'Apt or suite', ac: 'address-line2' },
    city: { l: 'City', ac: 'address-level2', req: 1 },
    state: { l: 'State', sel: [['', 'Pick a state']].concat(STATES.map(function (x) { return [x, x]; })), req: 1 },
    zip: { l: 'ZIP code', im: 'numeric', ac: 'postal-code', req: 1, pat: /^\d{5}$/, patMsg: 'Enter a 5-digit ZIP code.' },
    since: { l: 'Living at this address since', ph: 'June 2022', req: 1, help: 'Printed in point 2 of Annexure E.' },
    email: { l: 'Email', type: 'email', ac: 'email', req: 1, pat: /^\S+@\S+\.\S+$/, patMsg: 'Enter an email address.' },
    mobile: { l: 'US mobile', type: 'tel', ac: 'tel', ph: '415-555-0118', req: 1, pat: /^\D*(\d\D*){10}$/, patMsg: 'Enter a 10-digit US number.' },
    citizenship: { l: 'I became an Indian citizen by', sel: [['birth', 'Birth'], ['descent', 'Descent'], ['registration', 'Registration'], ['naturalization', 'Naturalization']] },
    repatriated: { l: 'Ever brought back to India at the government’s expense?', sel: [['no', 'No, never'], ['yes', 'Yes, and I paid it back']] },
    place: { l: 'Place where you’ll sign', ph: 'San Francisco', req: 1 },
    signDate: { l: 'Date you’ll sign', type: 'date', req: 1 },
    /* name change */
    oldName: { l: 'Former name (as on current passport)', req: 1, span: 1 },
    newName: { l: 'New name you want on the passport', req: 1, span: 1 },
    profession: { l: 'Profession or occupation', ph: 'Software engineer' },
    idNo: { l: 'Aadhaar or Voter ID number', help: 'Asked under the deponent’s signature. Leave empty if you have neither.' },
    witness1: { l: 'Witness 1: name and address', span: 1, help: 'Two witnesses sign in the notary’s presence.' },
    witness2: { l: 'Witness 2: name and address', span: 1 },
    /* joint photo */
    spousePassport: { l: 'Spouse’s passport no.', ph: 'Optional' },
    maidenName: { l: 'Wife’s name before marriage', req: 1 },
    husbandName: { l: 'Husband’s name', req: 1 },
    marriedName: { l: 'Wife’s name after marriage', req: 1 },
    marriageUnder: { l: 'Married under', ph: 'Hindu Marriage Act / Special Marriage Act / rites and customs', req: 1, span: 1 },
    marriageDate: { l: 'Date of marriage', type: 'date', req: 1 },
    /* lost / damaged */
    lostHow: { l: 'How and when the passport was lost or damaged', area: 1, req: 1, span: 1, ph: 'Lost in a cab in San Jose, CA on 12/09/2026. Reported to San Jose Police Department on 13/09/2026, report no. 26-123456.' },
    prevLost: { l: 'How many passports were lost or damaged earlier?', ph: 'None' },
    travelled: { l: 'Did you travel on it? Last flight into India', ph: 'Yes, AI 174 on 03/01/2026 into Delhi', span: 1 },
    trConcession: { l: 'Transfer-of-residence concessions or FTS allowance availed', ph: 'No' },
    res1: { l: 'Residence abroad (country, from, to, passport pages)', ph: 'USA, 08/2016, present, pages 4–9', span: 1 },
    piaObjection: { l: 'Any objection on the passport by the Passport Issuing Authority', ph: 'No' },
    deported: { l: 'Ever deported at government expense? Was it reimbursed?', ph: 'No' },
    /* minor */
    childName: { l: 'Child’s full name', req: 1, span: 1 },
    childDob: { l: 'Child’s date of birth', type: 'date', req: 1 },
    arn: { l: 'Child’s ARN (from the government form)', ph: 'SF1C26118413', help: 'Fill the government form first, then copy its Application Reference Number here.' },
    fCitizenship: { l: 'Father’s citizenship', ph: 'Indian' }, mCitizenship: { l: 'Mother’s citizenship', ph: 'Indian' },
    fPassport: { l: 'Father’s passport no.' }, mPassport: { l: 'Mother’s passport no.' },
    fPhone: { l: 'Father’s contact no.' }, mPhone: { l: 'Mother’s contact no.' },
    fEmail: { l: 'Father’s email' }, mEmail: { l: 'Mother’s email' },
    applyingParent: { l: 'Parent signing Annexure C', sel: [['mother', 'Mother'], ['father', 'Father']] },
    noConsentReason: { l: 'Why the other parent’s consent isn’t attached', sel: [['a', '(a) Residing abroad'], ['b', '(b) Travelling abroad'], ['c', '(c) Divorced, sole custody, no visitation'], ['d', '(d) Divorced, custody with visitation'], ['e', '(e) Divorce case pending, no prohibitory order'], ['f', '(f) Divorce case pending, prohibitory order'], ['g', '(g) Divorced, custody not disputed'], ['h', '(h) Other parent wilfully refuses'], ['i', '(i) Other parent deserted, whereabouts unknown']] },
    /* government form */
    givenName: { l: 'Given name (first + middle)', help: 'Initials and titles like Dr. aren’t allowed.' },
    surname: { l: 'Surname (last name)' },
    district: { l: 'District of birth' },
    marital: { l: 'Marital status', sel: [['Single', 'Single'], ['Married', 'Married'], ['Divorced', 'Divorced'], ['Widow/Widower', 'Widow/Widower'], ['Separated', 'Separated']] },
    employment: { l: 'Employment type', sel: [['Private', 'Private'], ['Self Employed', 'Self employed'], ['Government', 'Government'], ['PSU', 'PSU'], ['Student', 'Student'], ['Homemaker', 'Homemaker'], ['Retired', 'Retired'], ['Others', 'Others']] },
    education: { l: 'Educational qualification', sel: [['Graduate And Above', 'Graduate and above'], ['10th Pass And Above', '10th pass and above'], ['7th Pass Or Less', '7th pass or less'], ['Between 8th And 9th Standard', '8th or 9th standard']] },
    pan: { l: 'PAN', ph: 'ABCDE1234F' },
    visibleMark: { l: 'Visible distinguishing mark', ph: 'Mole on left cheek', help: '36 characters max on the portal.' },
    inHouse: { l: 'Indian address: house no. and street', span: 1, req: 1 },
    inCity: { l: 'Village/town/city', req: 1 }, inDistrict: { l: 'District', req: 1 }, inState: { l: 'State (India)', req: 1 }, inPin: { l: 'PIN code', req: 1, pat: /^\d{6}$/, patMsg: 'A PIN code is 6 digits.' },
    police: { l: 'Police station', req: 1, help: 'For the Indian address. A wrong police station is a common cause of delays.' },
    emName: { l: 'Emergency contact name', req: 1 }, emPhone: { l: 'Emergency contact mobile', req: 1 }, emAddr: { l: 'Emergency contact address', span: 1 },
    reissueReason: { l: 'Reason for re-issue', sel: [['Validity Expired Within 3 Years/Due To Expire', 'Validity expired within 3 years / due to expire'], ['Validity Expired More Than 3 Years Ago', 'Validity expired more than 3 years ago'], ['Exhaustion Of Pages', 'Exhaustion of pages'], ['Change In Existing Personal Particulars', 'Change in existing personal particulars'], ['Lost Passport', 'Lost passport'], ['Damaged Passport', 'Damaged passport']] }
  };

  /* ---- form definitions ---- */
  var LIST = [
    { id: 'govform', slug: 'passport-seva-online-form', name: 'Government online application form (answer sheet)', aka: 'Passport Seva GPSP 2.0 · mportal.passportindia.gov.in/mission', kind: 'guide', signs: 'You: uploaded signature on page 1, physical signature on the last page', notary: 'No', when: 'Every application. Filled online only; paper forms aren’t accepted.', fields: [['Service', ['reissueReason']], ['Applicant', ['givenName', 'surname', 'gender', 'dob', 'pob', 'district', 'pobState', 'marital', 'employment', 'education', 'pan', 'visibleMark']], ['Family', ['fatherName', 'motherName', 'spouseName']], ['Present address (USA)', ['street', 'apt', 'city', 'state', 'zip', 'mobile', 'email']], ['Address in India', ['inHouse', 'inCity', 'inDistrict', 'inState', 'inPin', 'police']], ['Emergency contact', ['emName', 'emPhone', 'emAddr']], ['Previous passport', ['passportNo', 'issueDate', 'expiry', 'issuePlace', 'fileNo']], ['Signing', ['place', 'signDate']]], src: 'Field labels from the GPSP 2.0 mission portal', q: 'how to fill indian passport renewal form online usa' },
    { id: 'checklist', slug: 'vfs-checklist', name: 'VFS document checklist (cover page)', aka: 'VFS USA re-issue checklist for your case (adult, minor, lost, damaged or Tatkal)', kind: 'official', signs: 'You, on the last page', notary: 'No', when: 'Every application. Goes on top of your packet.', fields: [['Applicant', ['fullName', 'passportNo', 'email', 'mobile']]], src: 'Official VFS USA PDF for your case, editions of 1 and 3 Nov 2026', q: 'vfs passport renewal checklist usa pdf' },
    { id: 'annexe', slug: 'annexure-e', name: 'Annexure E', aka: 'Specimen declaration of the applicant on a plain paper (self-declaration)', kind: 'official', signs: 'You', notary: 'No', when: 'Every application, adult and minor.', fields: [['As on your passport', ['fullName', 'gender', 'dob', 'relation', 'fatherName', 'motherName', 'married', 'spouseName']], ['US address', ['street', 'apt', 'city', 'state', 'zip', 'since']], ['Declarations', ['citizenship', 'repatriated', 'place', 'signDate']]], src: 'Official VFS USA PDF (annexure-e-mandatory.pdf)', q: 'annexure e passport' },
    { id: 'affidavit', slug: 'affidavit-change-in-appearance-and-signature', name: 'Affidavit for Change in Appearance and Signature', aka: 'VFS: “Affidavit for change of appearance & signature”', kind: 'official', signs: 'You (paste one photo)', notary: 'No (yes only for short-validity asylum and U-visa re-issues)', when: 'Every application, even if nothing changed.', fields: [['As on your passport', ['fullName', 'fatherName', 'passportNo', 'issueDate', 'issuePlace']], ['US address', ['street', 'apt', 'city', 'state', 'zip']], ['Signing', ['place', 'signDate']]], src: 'Official VFS USA PDF', q: 'affidavit for change in appearance and signature' },
    { id: 'namechange', slug: 'name-change-affidavit', name: 'Affidavit of Name Change', aka: 'Specimen affidavit for change in name / deed poll / sworn affidavit', kind: 'typeset', signs: 'You, plus 2 witnesses', notary: 'Yes', when: 'Changing your name for any reason. Not due to marriage or divorce? Also newspaper ads in India and the US.', fields: [['Your names', ['oldName', 'newName', 'profession', 'relation', 'fatherName', 'married', 'spouseName']], ['Address', ['street', 'apt', 'city', 'state', 'zip']], ['Signing', ['witness1', 'witness2', 'place', 'signDate']]], src: 'VFS USA PDF (name-change-affidavit.pdf), checked 17 Nov 2026', q: 'name change affidavit indian passport usa' },
    { id: 'annexj', slug: 'annexure-j-joint-photo-declaration', name: 'Annexure J: Joint Photo Declaration', aka: 'Joint declaration in lieu of marriage certificate', kind: 'typeset', signs: 'Husband and wife, with a self-attested joint photo', notary: 'Yes (VFS USA)', when: 'Adding or changing a spouse’s name, or changing surname after marriage, without a marriage certificate.', fields: [['You', ['fullName', 'gender', 'passportNo', 'street', 'apt', 'city', 'state', 'zip']], ['Spouse', ['spouseName', 'spousePassport']], ['Signing', ['place', 'signDate']]], src: 'Official Passport Seva Annexure J text; VFS USA publishes no format of its own', q: 'annexure j joint photo declaration passport' },
    { id: 'annexf', slug: 'annexure-f', name: 'Annexure F', aka: 'Specimen declaration of applicant for obtaining a passport in lieu of lost/damaged passport', kind: 'typeset', signs: 'You', notary: 'No (original, plain paper, signed)', when: 'Lost or damaged passport. Attach a police report not more than 6 months old for a lost passport.', fields: [['You', ['fullName', 'relation', 'fatherName', 'married', 'spouseName', 'street', 'apt', 'city', 'state', 'zip']], ['What happened', ['lostHow', 'prevLost', 'travelled', 'trConcession', 'res1', 'piaObjection', 'deported']], ['Signing', ['place', 'signDate']]], src: 'VFS USA PDF (annexure-f.pdf), checked 17 Nov 2026', q: 'annexure f lost passport' },
    { id: 'annexd', slug: 'annexure-d', name: 'Annexure D', aka: 'Specimen declaration by applicant’s parent(s) or guardian for issue of passport to minor', kind: 'typeset', signs: 'Both parents', notary: 'Yes (VFS USA)', when: 'Every minor’s application.', fields: [['Child', ['childName', 'childDob', 'arn']], ['Father', ['fatherName', 'fCitizenship', 'fPassport', 'fPhone', 'fEmail']], ['Mother', ['motherName', 'mCitizenship', 'mPassport', 'mPhone', 'mEmail']], ['Address', ['street', 'apt', 'city', 'state', 'zip']], ['Signing', ['place', 'signDate']]], src: 'Official Passport Seva Annexure D text', q: 'annexure d passport minor usa' },
    { id: 'annexc', slug: 'annexure-c', name: 'Annexure C', aka: 'Specimen declaration by parent or guardian when one parent has not given consent', kind: 'typeset', signs: 'The parent applying', notary: 'Yes (VFS USA practice)', when: 'Minor’s application when one parent can’t or won’t consent: abroad, divorced, deceased or deserted.', fields: [['Child', ['childName', 'childDob', 'arn']], ['Parents', ['fatherName', 'fCitizenship', 'fPassport', 'fPhone', 'fEmail', 'motherName', 'mCitizenship', 'mPassport', 'mPhone', 'mEmail']], ['Address', ['street', 'apt', 'city', 'state', 'zip']], ['Reason', ['applyingParent', 'noConsentReason', 'place', 'signDate']]], src: 'Official Passport Seva Annexure C text', q: 'annexure c passport' },
  ];
  var BY = {}; LIST.forEach(function (f) { BY[f.id] = f; });

  /* ---- specimen bodies (verbatim structure, values filled) ---- */
  function blocks(id, d) {
    var dt = day(d.signDate);
    if (id === 'namechange') {
      var old = U(d.oldName), nw = U(d.newName);
      return [
        { t: 'title', text: 'AFFIDAVIT FOR CHANGE IN NAME' }, { t: 'sub', text: '(SPECIMEN AFFIDAVIT FOR CHANGE IN NAME / DEED POLL / SWORN AFFIDAVIT)' }, { t: 'note', text: '(In the USA, sign before a Notary Public. VFS USA requires the original, notarized with stamp and notary signature.)' }, { t: 'gap', h: 6 },
        { t: 'p', runs: ['By this deed I, the undersigned ', v(nw, 'new name'), ' (new name) previously called ', v(old, 'old name'), ' (old name), doing ', v(d.profession, 'profession or vocation'), ' (give profession or vocation) and resident of ', v(U(addr(d)), 'address'), ' (address) solemnly declare:'] },
        { t: 'li', n: '1.', runs: ['That for and on behalf of myself and my wife, children and remitter issue, I wholly renounce/relinquish and abandon the use of my former name/surname of ', v(old), ' and in place thereof, I do hereby assume from this date the name/surname ', v(nw), ', so that I and my wife, children and remitter issue may hereafter be called, known and distinguished not by my former name/surname, but assumed name/surname of ', v(nw), '.'] },
        { t: 'li', n: '2.', runs: ['That for the purpose of evidencing such my determination declare that I shall at all times hereafter in all records, deeds and writings and in all proceedings, dealings and transactions, private as well as upon all occasions whatsoever, use and sign the name of ', v(nw), ' as my name/surname in place and in substitution of my former name/surname.'] },
        { t: 'li', n: '3.', runs: ['That I expressly authorize and request all persons in general and relatives and friends in particular, at all times hereafter to designate and address me, my wife, my children, and remitter issue by such assumed name/surname of ', v(nw), '.'] },
        { t: 'li', n: '4.', runs: ['In witness whereof I have hereunto subscribed my former and adopted name/surname of ', v(old), ' and ', v(nw), ' affix my signature and seal, if any, this ', v(dt[0], 'day'), ' day of ', v(dt[1], 'month year'), '.'] },
        { t: 'sign', left: [['Signed sealed and delivered by the above name'], ['Date: ', v(D(d.signDate))], ['Place: ', v(U(d.place))], ['Former name: ', v(old)]], right: [['____________________________'], ['(Signature in former name)'], ['____________________________'], ['(Signature in new name)']] },
        { t: 'p', runs: [{ b: 'In the presence of:' }] },
        { t: 'sign', left: [['1. ', v(U(d.witness1), 'name and address')], ['Signature: ____________________']], right: [['2. ', v(U(d.witness2), 'name and address')], ['Signature: ____________________']] },
        { t: 'box', label: 'Notary Public: seal, signature and commission expiry', h: 80, w: 240 },
        { t: 'note', text: 'Note: Affidavit to be sworn before/attested by a Judicial Magistrate, Executive Magistrate, Oath Commissioner, Notary Public or Consular Officer in an Indian Mission abroad. VFS USA requires the original, notarized, and the notary stamp’s expiry date must not be corrected by hand. If the change is not due to marriage, remarriage or divorce, also send full-page newspaper advertisements: one national daily in India and one national daily in the USA (or the state gazette).' }
      ];
    }
    if (id === 'annexj') {
      var hus = d.gender === 'F' ? d.spouseName : d.fullName, wife = d.gender === 'F' ? d.fullName : d.spouseName;
      var hp = d.gender === 'F' ? d.spousePassport : d.passportNo, wp = d.gender === 'F' ? d.passportNo : d.spousePassport;
      return [
        { t: 'p', runs: [{ b: 'Annexure ‘J’' }] },
        { t: 'title', text: 'JOINT DECLARATION IN LIEU OF MARRIAGE CERTIFICATE' }, { t: 'gap', h: 8 },
        { t: 'p', runs: ['I ', v(U(d.fullName), 'name'), ' (Name of the passport applicant) resident of ', v(U(addr(d)), 'address'), ' declare and affirm as under:'] },
        { t: 'li', n: '1.', runs: ['That I am married with ', v(U(d.spouseName), 'spouse name'), ' (Name of spouse) and has been living together as married couple.'] },
        { t: 'li', n: '2.', runs: ['That my passport be ', { s: 'issued' }, '/', { b: 'reissued' }, ' with my spouse name as ', v(U(d.spouseName), 'spouse name'), ' (Name of the spouse).'] },
        { t: 'li', n: '3.', runs: ['That I solemnly affirm that the information given above is correct to the best of my knowledge and in case of litigation arising due to issue/reissue of my passport, I would be solely responsible for defending the case and not the passport issuing authority.'] },
        { t: 'box', label: 'Latest joint photographs of husband and wife (to be self attested on the photo)', h: 120, w: 300 },
        { t: 'sign', left: [['Place: ', v(U(d.place))], ['____________________________'], ['(Signature of Applicant/husband)'], ['Name ', v(U(hus)), ' or'], ['Aadhaar Card No ………… or'], ['Voter ID Card no ………… or'], ['Passport No ', v(U(hp), 'passport no.')]], right: [['Date: ', v(D(d.signDate))], ['____________________________'], ['(Signature of Applicant/wife)'], ['Name ', v(U(wife)), ' or'], ['Aadhaar Card No ………… or'], ['Voter ID Card no ………… or'], ['Passport No ', v(U(wp), 'passport no.')]] },
        { t: 'box', label: 'Notary Public: seal and signature (VFS USA asks for a duly notarized joint photo declaration)', h: 64, w: 360 },
        { t: 'note', text: 'Used instead of a marriage certificate to add or change a spouse’s name, or for a woman to change her surname after marriage. Both husband and wife sign, and self-attest the joint photograph.' }
      ];
    }
    if (id === 'annexf') {
      var r = rel(d);
      return [
        { t: 'title', text: 'ANNEXURE ‘F’' }, { t: 'sub', text: 'SPECIMEN DECLARATION OF APPLICANT FOR OBTAINING A PASSPORT IN LIEU OF LOST/ DAMAGED PASSPORT' }, { t: 'gap', h: 6 },
        { t: 'p', runs: ['I ', v(U(d.fullName), 'name'), ' '].concat(['S/o', 'D/o', 'W/o'].map(function (o, i) { var on = (r === 'Son of' && o === 'S/o') || (r === 'Daughter of' && o === 'D/o') || (r === 'Wife of' && o === 'W/o'); return (i ? [', ', on ? { b: o } : { s: o }] : [on ? { b: o } : { s: o }]); }).reduce(function (a, b) { return a.concat(b); }, [])).concat([' Shri. ', v(U(r === 'Wife of' ? d.spouseName : d.fatherName), 'father’s / husband’s name'), ' residing at ', v(U(addr(d)), 'address'), ' solemnly affirm as follows:']) },
        { t: 'li', n: '1.', runs: ['State how and when the passport was lost/ damaged and when FIR was lodged at which Police Station and how many passports were lost/ damaged earlier? ', v(d.lostHow, 'how, when, police report'), ' Lost/damaged earlier: ', v(d.prevLost || 'None')] },
        { t: 'li', n: '2.', runs: ['State whether you travelled on the lost/ damaged passport, if so state flight number and date and port of entry into India? ', v(d.travelled, 'flight, date, port of entry')] },
        { t: 'li', n: '3.', runs: ['State whether you availed of any TR concessions/FTs allowance and if so details thereof? ', v(d.trConcession || 'No')] },
        { t: 'li', n: '4.', runs: ['State whether non-resident Indian and if resident abroad, the details of the residence as follows:'] },
        { t: 'table', widths: [0.1, 0.25, 0.3, 0.35], head: ['S. No.', 'Name of the Country', 'Length of residence (From – To)', 'Page Nos. with departure/arrival stamps'], rows: [['1.'].concat((d.res1 || '').split(/,\s*/).length >= 3 ? [(d.res1 || '').split(/,\s*/)[0], (d.res1 || '').split(/,\s*/).slice(1, 3).join(' – '), (d.res1 || '').split(/,\s*/).slice(3).join(', ')] : [d.res1 || '', '', '']), ['2.', '', '', ''], ['3.', '', '', '']] },
        { t: 'li', n: '5.', runs: ['State whether the Passport had any objection by the PIA and if so the details thereof. ', v(d.piaObjection || 'No')] },
        { t: 'li', n: '6.', runs: ['State whether you were deported at any time at the expenses of the Government and if so was the expenditure incurred reimbursed to Government of India. ', v(d.deported || 'No')] },
        { t: 'p', runs: ['I further affirm that I will take utmost care of my passport if issued and the Government will be at liberty to take any legal action under the Passports Act, 1967, if the lapse is repeated.'] },
        { t: 'sign', left: [['Place: ', v(U(d.place))], ['Date: ', v(D(d.signDate))]], right: [['____________________________'], ['(Signature of applicant)']] },
        { t: 'note', text: 'VFS USA: mandatory for lost or damaged passports. Lost: attach a police report, not more than 6 months old, naming you and the lost passport. Damaged: send the damaged passport. Tatkal is not available for lost or damaged passports.' }
      ];
    }
    if (id === 'annexd' || id === 'annexc') {
      var grid = { t: 'grid', rows: [['Name of father ', U(d.fatherName), 'Name of Mother ', U(d.motherName)], ['Citizenship ', U(d.fCitizenship || 'Indian'), 'Citizenship ', U(d.mCitizenship || 'Indian')], ['Passport No ', U(d.fPassport), 'Passport No ', U(d.mPassport)], ['Contact No ', d.fPhone || '', 'Contact No ', d.mPhone || ''], ['Email ID ', d.fEmail || '', 'Email ID ', d.mEmail || ''], ['Address ', U(addr(d)), 'Address ', U(addr(d))]] };
      var head = [{ t: 'p', runs: ['Name of the minor child: ', v(U(d.childName), 'child’s name')] }, { t: 'p', runs: ['Date of Birth: ', v(D(d.childDob), 'DD/MM/YYYY')] }, grid];
      var ids = function (who) { return [['Passport no: (preferably) ', v(who === 'f' ? U(d.fPassport) : U(d.mPassport)), '; or'], ['Aadhaar Card No / Voter ID / PAN / Driving License No. ……………']]; };
      var warn = { t: 'li', n: id === 'annexd' ? '4.' : '5.', runs: [(id === 'annexd' ? 'I/We' : 'I') + ' hereby certify and undertake that if any information provided in the above declaration is found incorrect or misleading, following action may be taken by the Passport Authority for: a) Cancellation (impounding/ revocation) of the passport issued on the basis of this declaration; b) Initiating criminal proceedings under relevant provisions of Bharatiya Nyaya Sanhita, 2023 and the Passports Act, 1967'] };
      if (id === 'annexd') {
        return [{ t: 'title', text: 'ANNEXURE ‘D’' }, { t: 'sub', text: 'SPECIMEN DECLARATION BY APPLICANT’S PARENT(S) OR GUARDIAN FOR ISSUE OF PASSPORT TO MINOR' }, { t: 'note', text: '(On plain paper)' },
          { t: 'p', runs: ['I/We, parent(s)/legal guardian of minor child whose details are mentioned below solemnly declare and affirm as under:-'] }].concat(head, [
          { t: 'li', n: '1.', runs: ['That I/We am/are the mother/father/parent(s)/legal guardian(s) of the above minor child on whose behalf I/We am/are submitting passport application vide ARN no ', v(U(d.arn), 'ARN'), '.'] },
          { t: 'li', n: '2.', runs: ['The minor child mentioned above is a citizen of India. I/We solemnly declare that he/she has not lost, surrendered or has been deprived of his/her citizenship of India.'] },
          { t: 'li', n: '3.', runs: ['I/We undertake the entire responsibility for his/her expenses.'] }, warn,
          { t: 'sign', left: [['Signature of father/legal guardian ____________'], ['Name of father: ', v(U(d.fatherName))]].concat(ids('f')).concat([['Date: ', v(D(d.signDate))], ['Place: ', v(U(d.place))]]), right: [['Signature of Mother/Legal Guardian ____________'], ['Name of Mother: ', v(U(d.motherName))]].concat(ids('m')) },
          { t: 'box', label: 'Notary Public: seal and signature (VFS USA: signed by both parents and notarized)', h: 70, w: 320 },
          { t: 'note', text: 'Note: 1. In case of ‘Legal guardian’, copy of court order appointing ‘Legal guardian’ of minor to be attached. 2. Section 5 of the Passports Act 1967 read with Rule 5 of the Passports Rules, 1980 stipulates that Passport Authority may make all such enquiry and may require an applicant to furnish such additional information, documents or certificates, as may be considered necessary by the Passport Authority for the proper disposal of the application required.' }]);
      }
      var me = d.applyingParent || 'mother', other = me === 'mother' ? 'father' : 'mother';
      var OPTS = [['a', 'The father/mother of the minor applicant ‘Residing abroad’ and unable to provide consent. [Supporting documents: Copy of Passport; Proof of residence abroad (Long term/Resident Visa, departure/immigration stamp)]'], ['b', 'The father/mother of the minor applicant is ‘Travelling abroad’ and unable to provide consent. [Supporting documents: Copy of Passport; Proof of travel abroad (Visa, departure/immigration stamp, ticket/boarding pass)]'], ['c', 'The parents are divorced/judicially separated and custody of minor has been assigned to one parent (parent who is applying for the passport), without visitation rights to the other parent. [Copy of court order/ decree regarding divorce/judicial separation]'], ['d', 'The parents are divorced/judicially separated and custody of minor has been assigned to one parent (parent who is applying for the passport), with visitation rights to the other parent. [Copy of court order/ decree; consent of other parent (having visitation rights) is also required]'], ['e', 'There is an ongoing court case for divorce/judicial separation (including on the issue of custody of minor child) and court has not given any order prohibiting the issue of passport, without the consent of the father/mother. [Copy of divorce petition/application]'], ['f', 'There is an ongoing court case for divorce/judicial separation (including on the issue of custody of minor child) and there is prohibitory order for prohibiting the issue of passport, without the consent of the father/mother. [The consent of both the parents or permission from the court]'], ['g', 'The parents are divorced/ judicially separated or there is ongoing court case for divorce/judicial separation however the custody of minor child has not been invoked/ prayed in the divorce petition or the custody of the minor is not disputed. [Copy of divorce decree/court order or Divorce petition/application as the case may be.]'], ['h', 'One of the parents is willfully denying to give his/her consent. [Copy of communication/documents from other parent denying consent.]'], ['i', 'One of the parents has deserted/ abandoned child/parent after conception/birth of child and whereabouts of such parent are not known. [Appropriate supporting documents.]']];
      return [{ t: 'title', text: 'ANNEXURE ‘C’' }, { t: 'sub', text: 'SPECIMEN DECLARATION BY APPLICANT’S PARENT OR GUARDIAN FOR ISSUE OF PASSPORT TO MINOR WHEN ONE PARENT HAS NOT GIVEN CONSENT' }, { t: 'note', text: '(On plain paper)' },
        { t: 'p', runs: ['I, ', me === 'father' ? { b: 'father' } : { s: 'father' }, '/', me === 'mother' ? { b: 'mother' } : { s: 'mother' }, ' of minor child whose details are mentioned below solemnly declare and affirm as under:-'] }].concat(head, [
        { t: 'li', n: '1.', runs: ['That I am the ', me === 'mother' ? { b: 'mother' } : { s: 'mother' }, '/', me === 'father' ? { b: 'father' } : { s: 'father' }, ' of the above minor child on whose behalf I am submitting passport application vide ARN no ', v(U(d.arn), 'ARN'), '.'] },
        { t: 'li', n: '2.', runs: ['Signature/consent of Shri/Smt ', v(U(other === 'father' ? d.fatherName : d.motherName), 'other parent'), ' (name of the father/mother) who is the ' + other + ' of the child has not been obtained by me for the following one or more reasons:-'] }].concat(OPTS.map(function (o) { return { t: 'opt', n: '(' + o[0] + ')', runs: [o[1]], off: o[0] !== (d.noConsentReason || 'a') }; }), [
        { t: 'note', text: '* Please put a cross mark on all other options above which are not applicable.' },
        { t: 'li', n: '3.', runs: ['The minor child mentioned above is a citizen of India. I solemnly declare that he /she has not lost, surrendered or been deprived of his/her citizenship of India and that the information given in respect of him/her in this application is true. That I only am taking care of ', v(U(d.childName)), ' (name of the minor child) and he/she is exclusively in my physical custody.'] },
        { t: 'li', n: '4.', runs: ['I also affirm that in the case of a court case arising due to issue of a passport to the minor child ', v(U(d.childName)), ' (name of the minor child) in the above scenario(s), I would be solely responsible for defending the case and not the Passport Issuing Authority.'] }, warn,
        { t: 'sign', left: [['Signature of ' + me + '/legal guardian: ______________'], ['Name of ' + me + '/legal guardian: ', v(U(me === 'father' ? d.fatherName : d.motherName))]].concat(ids(me === 'father' ? 'f' : 'm')).concat([['Date: ', v(D(d.signDate))], ['Place: ', v(U(d.place))]]), right: [] },
        { t: 'box', label: 'Notary Public: seal and signature', h: 60, w: 260 },
        { t: 'note', text: 'Note: 1. Non submission of consent of other parent is only for issuance of passport and will not have any bearing on mentioning names of both the parent in the passport. 2. Section 5 of the Passports Act 1967 read with Rule 5 of the Passports Rules, 1980 stipulates that Passport Authority may make all such enquiry and may require an applicant to furnish such additional information, documents or certificates, as may be considered necessary.' }]));
    }
    if (id === 'govform') {
      return gov(d).reduce(function (acc, s) { return acc.concat([{ t: 'sub', text: s.h.toUpperCase() }, { t: 'table', widths: [0.6, 0.4], labelCol: 1, head: ['Field on the portal', 'Your answer'], rows: s.rows.map(function (r) { return [r[0], r[1] || 'Fill this in yourself']; }) }]); }, [{ t: 'title', text: 'PASSPORT SEVA (GPSP 2.0) RE-ISSUE: YOUR ANSWERS' }, { t: 'note', text: 'Copy these into the government online form at mportal.passportindia.gov.in/mission. Use CAPITAL LETTERS and match your current passport exactly. You cannot edit the form after you submit it.' }]);
    }
    return [];
  }

  /* ---- government form answer sheet (GPSP 2.0 labels) ---- */
  function gov(d) {
    var parts = (d.fullName || '').trim().split(/\s+/);
    var given = d.givenName || (parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0] || '');
    var sur = d.surname || (parts.length > 1 ? parts[parts.length - 1] : '');
    var split = function (n) { var p = (n || '').trim().split(/\s+/); return p.length > 1 ? [p.slice(0, -1).join(' '), p[p.length - 1]] : [p[0] || '', '']; };
    var fa = split(d.fatherName), mo = split(d.motherName), sp = split(d.spouseName);
    var reason = d.reissueReason || 'Validity Expired Within 3 Years/Due To Expire';
    return [
      { h: 'Step 1 · Passport Type', rows: [['Applying for*', 'Re-issue of Passport'], ['Reason(s) for Re-issue', reason], ['If Change In Existing Personal Particulars, Please Specify', d.changesText || ''], ['Type of Application*', d.speed === 'tatkal' ? 'Tatkaal' : 'Normal'], ['Type of Passport Booklet*', (d.pages || '36') + ' Pages']] },
      { h: 'Step 2 · Applicant Details', rows: [['Given Name*', U(given)], ['Surname', U(sur)], ['Gender*', { M: 'Male', F: 'Female', X: 'Transgender' }[d.gender || 'M']], ['Have you ever been known by other names (aliases)?*', 'No'], ['Have you ever changed your name?*', d.oldName ? 'Yes: ' + U(d.oldName) : 'No'], ['Date of Birth (DD/MM/YYYY)*', D(d.dob)], ['Place of Birth (Village/Town/City)*', U(d.pob)], ['Is your Place of Birth out of India?*', 'No'], ['State/UT*', U(d.pobState)], ['District*', U(d.district)], ['Marital Status*', d.marital || (d.married === 'yes' ? 'Married' : 'Single')], ['Citizenship of India by*', { birth: 'Birth', descent: 'Descent', registration: 'Registration', naturalization: 'Registration/ Naturalization' }[d.citizenship || 'birth']], ['PAN (if available)', U(d.pan)], ['Voter Id (if available)', ''], ['Employment Type*', d.employment || ''], ['Educational Qualification*', d.education || ''], ['Is either of your parent (in case of minor)/spouse, a government servant?*', ''], ['Is applicant eligible for Non-ECR category?*', d.education === 'Graduate And Above' || d.education === '10th Pass And Above' ? 'Yes' : ''], ['Visible distinguishing mark', U(d.visibleMark)], ['Aadhaar Number (if available)', '']] },
      { h: 'Step 3 · Family Details', rows: [['Father’s Given Name', U(fa[0])], ['Father’s Surname', U(fa[1])], ['Mother’s Given Name', U(mo[0])], ['Mother’s Surname', U(mo[1])], ['Spouse’s Given Name', d.married === 'yes' ? U(sp[0]) : 'Not applicable'], ['Spouse’s Surname', d.married === 'yes' ? U(sp[1]) : 'Not applicable']] },
      { h: 'Step 4 · Address Details', rows: [['Is your passport printable address out of India?*', 'Yes'], ['Region/Country*', 'UNITED STATES OF AMERICA'], ['Address Line 1* (House No. and Street Name)', U([d.street, d.apt].filter(Boolean).join(', '))], ['Address Line 2* (Village/Town/City etc.)', U([d.city, d.state].filter(Boolean).join(', '))], ['Address Line 3 (ZIP code and Country etc.)', [d.zip, 'USA'].filter(Boolean).join(', ')], ['Mobile Number*', d.mobile], ['E-mail Id*', d.email], ['Is your other address out of India?*', 'No (Indian address, for police verification)'], ['House No. and Street Name*', U(d.inHouse)], ['Village/Town/City*', U(d.inCity)], ['PIN Code*', d.inPin], ['State/UT*', U(d.inState)], ['District*', U(d.inDistrict)], ['Police Station*', U(d.police)]] },
      { h: 'Step 5 · Emergency Contact Details', rows: [['Name and Address*', U([d.emName, d.emAddr].filter(Boolean).join(', '))], ['Mobile Number*', d.emPhone], ['E-mail Id', '']] },
      { h: 'Step 6 · Previous Passport Details', rows: [['Passport Number*', U(d.passportNo)], ['Place of Issue (Village/Town/City)*', U(d.issuePlace)], ['Date of Issue (DD/MM/YYYY)*', D(d.issueDate)], ['Date of Expiry (DD/MM/YYYY)*', D(d.expiry)], ['File Number*', U(d.fileNo)], ['Have you ever held/hold any Identity Certificate?', 'No'], ['Have you ever applied for passport, but not issued?*', 'No']] },
      { h: 'Step 7 · Other Details (answer yourself, truthfully)', rows: [['1.1) Are any proceedings in respect of an offence alleged to have been committed by you pending before a criminal court in India?*', ''], ['1.2) Has any warrant or summons for your appearance been issued & pending before a court?*', ''], ['1.3) Has a warrant for your arrest been issued by a court?*', ''], ['1.4) Has an order prohibiting your departure from India been made by any court?*', ''], ['2.1) Convicted by a court in India in the five years before this application?*', ''], ['3.1) Have you ever been refused/denied passport?*', ''], ['3.2) Has your passport ever been impounded?*', ''], ['3.3) Has your passport ever been revoked?*', ''], ['4.1) Have you ever been granted citizenship by any other country?*', ''], ['4.2) Have you ever held the passport of any other country at any time?*', ''], ['4.3) Have you ever surrendered your Indian passport?*', ''], ['4.4) Have you ever applied for renunciation of Indian citizenship?*', ''], ['5.1) Have you ever returned to India on Emergency Certificate (EC)?*', ''], ['5.2) Have you ever been deported from any country?*', ''], ['5.3) Have you ever been repatriated from any country back to India?*', d.repatriated === 'yes' ? 'Yes (cost refunded)' : '']] },
      { h: 'Step 9 · Details Verification', rows: [['I Agree (self-declaration)', 'Tick after reading it'], ['Place*', U(d.place)], ['Date*', D(d.signDate)]] }
    ];
  }

  async function build(id, d, src) {
    if (id === 'checklist') return LesserForms.fillChecklist(await src('checklist'), d);
    if (id === 'annexe') return LesserForms.fillAnnexureE(await src('annexe'), d);
    if (id === 'affidavit') return LesserForms.fillAffidavit(await src('affidavit'), d);
    return Typeset.pdf(blocks(id, d), { title: BY[id].name });
  }
  return { LIST: LIST, BY: BY, FIELDS: FIELDS, blocks: blocks, gov: gov, build: build, rel: rel, relName: relName, addr: addr };
})();

