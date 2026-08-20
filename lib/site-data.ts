export type Service = { number: string; title: string; description: string };
export type Project = { meta: string; title: string; image: string };
export type FAQItem = { question: string; answer: string };

export const site = {
  name: "EH Electric & HVAC",
  shortName: "EH",
  phone: "(617) 555-0148",
  email: "projects@ehelectrichvac.com",
  address: "Greater Boston, Massachusetts",
  careersUrl: "#careers",
};

export const services: Service[] = [
  { number: "01", title: "Electrical Construction", description: "Coordinated electrical installations for commercial, institutional, and renovation projects with disciplined field execution." },
  { number: "02", title: "HVAC Systems", description: "Heating, cooling, ventilation, and controls delivered with a focus on reliability, efficiency, commissioning, and maintainability." },
  { number: "03", title: "Preconstruction & Estimating", description: "Clear scopes, constructability reviews, pricing, scheduling, and procurement planning before crews mobilize." },
  { number: "04", title: "Renovation & Retrofit", description: "Upgrades inside occupied and operational buildings, sequenced to reduce disruption and protect existing systems." },
  { number: "05", title: "Service & Infrastructure Upgrades", description: "Electrical distribution, equipment replacements, mechanical upgrades, and critical-system improvements planned around operations." },
];

export const approach = [
  {
    title: "Client-Focused",
    body: "Structured communication, transparent decisions, and responsive coordination keep stakeholders aligned from preconstruction through closeout.",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Safety-First",
    body: "Planning, documentation, and field accountability are built into the work from day one rather than added at the end.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Mission-Driven",
    body: "Every project is approached as a long-term asset that should serve occupants, owners, and operators well.",
    image:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Built on Clarity",
    body: "Clear expectations, defined responsibilities, and visible next steps help prevent confusion and keep work moving with confidence.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Committed Through Closeout",
    body: "We carry the same attention through testing, punch-list completion, documentation, turnover, and final client handoff.",
    image:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=85",
  },
] as const;

export const projectFlows = [
  { title: "Renovation", meaning: "Targeted improvements to modernize existing spaces and systems.", why: "Renovation can extend building value and improve performance without starting from zero.", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80" },
  { title: "Retrofitting", meaning: "Upgrading existing electrical and HVAC infrastructure for current standards.", why: "Retrofits can improve resilience, comfort, efficiency, and code compliance.", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80" },
  { title: "Remediation", meaning: "Corrective work that addresses deficiencies affecting safety or performance.", why: "Focused remediation protects occupants, equipment, schedules, and future maintenance budgets.", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80" },
  { title: "Restoration", meaning: "Careful renewal of important spaces while respecting existing architecture.", why: "Restoration preserves what matters while integrating modern building systems thoughtfully.", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1600&q=80" },
];

export const stats = [
  ["98%", "Client satisfaction target"],
  ["75+", "Years of combined field experience"],
  ["24/7", "Emergency coordination availability"],
  ["90%", "Referral-driven growth target"],
  ["88+", "Complex scopes supported"],
  ["100%", "Safety and compliance commitment"],
  ["50%", "Faster planning through digital workflows"],
  ["40+", "Concurrent service and project scopes"],
] as const;

export const projects: Project[] = [
  { meta: "Boston, MA | Commercial | Renovation", title: "Occupied Office Electrical Modernization", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80" },
  { meta: "Cambridge, MA | Institutional | Retrofit", title: "Mechanical Plant Controls Upgrade", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80" },
  { meta: "Somerville, MA | Hospitality | Fit-Out", title: "Restaurant MEP Fit-Out", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80" },
  { meta: "Chelsea, MA | Multifamily | Upgrade", title: "Building-Wide Electrical Service Upgrade", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80" },
  { meta: "Quincy, MA | Municipal | HVAC", title: "Public Facility HVAC Replacement", image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1400&q=80" },
  { meta: "Boston, MA | Retail | Retrofit", title: "Retail Lighting and Controls Retrofit", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80" },
  { meta: "Waltham, MA | Industrial | Infrastructure", title: "Critical Equipment Power Distribution", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1400&q=80" },
];

export const values = [
  ["Productivity", "We use clear scopes, digital coordination, and practical scheduling so every action advances the work."],
  ["Purpose", "We choose work where dependable building systems can make a meaningful difference for people and operations."],
  ["Priority", "When field conditions change, we identify what matters most and keep decisions moving."],
  ["People", "Strong outcomes depend on respectful relationships among clients, trade partners, crews, and occupants."],
  ["Integrity", "We communicate clearly, document accurately, and treat quality as a responsibility rather than a slogan."],
] as const;

export const faqs: FAQItem[] = [
  { question: "What is it like to work with your team?", answer: "Clients can expect a structured, responsive process with clear points of contact, documented decisions, and straightforward communication from preconstruction through closeout." },
  { question: "How do you handle project documentation?", answer: "We organize submittals, RFIs, schedules, change documentation, testing records, and closeout requirements using consistent digital workflows." },
  { question: "How do you reduce schedule delays?", answer: "We surface long-lead items early, coordinate shutdowns and access in advance, and make constraints visible before they become field emergencies." },
  { question: "Can you work in occupied facilities?", answer: "Yes. We plan phasing, temporary protection, shutdowns, noise, cleanliness, and communication around the needs of active occupants and operators." },
  { question: "Who will I work with?", answer: "A defined project lead coordinates estimating, field supervision, scheduling, documentation, and client communication, with specialists added as the scope requires." },
  { question: "How is safety managed?", answer: "Safety starts with pre-planning and continues through task planning, site controls, documentation, and field accountability." },
  { question: "Do you only take large projects?", answer: "No. We evaluate projects based on fit, complexity, schedule, location, and the value we can add—not just contract size." },
  { question: "How do you choose trade partners?", answer: "We value partners who communicate well, document carefully, plan ahead, protect the site, and consistently finish what they commit to." },
  { question: "What happens after construction?", answer: "Closeout includes punch-list completion, documentation, testing records, warranties, training where applicable, and a clear turnover package." },
  { question: "How do I start a project?", answer: "Use the consultation form to share your project type, scope, location, timing, and budget range. We can then determine the best next step." },
];
