// config/regulatory.js
// Regulatory framework references used in compliance records

export const REGULATORY = {
  DORA: {
    name:    'Digital Operational Resilience Act',
    article: 'Article 11 — ICT Incident Management',
    url:     'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022R2554',
    requirement: 'Financial entities shall classify ICT-related incidents and shall determine their impact based on criteria such as the number of clients affected, the duration of the incident and the geographic spread.',
  },
  SOX: {
    name:    'Sarbanes-Oxley Act',
    section: 'Section 404 — IT General Controls',
    requirement: 'Management must assess the effectiveness of internal control over financial reporting. IT systems and automated controls must be documented and auditable.',
  },
  EU_AI_ACT: {
    name:    'EU AI Act',
    article: 'Article 13 — Transparency and provision of information to deployers',
    requirement: 'High-risk AI systems shall be designed and developed in such a way as to ensure that their operation is sufficiently transparent to enable deployers to interpret the system\'s output and use it appropriately.',
  },
};
