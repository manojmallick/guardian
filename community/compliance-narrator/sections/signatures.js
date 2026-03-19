// community/compliance-narrator/sections/signatures.js
export function buildSignaturesSection() {
  return {
    incident_commander:  { name: '', signed: false, date: '' },
    compliance_officer:  { name: '', signed: false, date: '' },
    note: 'Please sign and date to certify accuracy of this post-mortem report.',
  };
}
