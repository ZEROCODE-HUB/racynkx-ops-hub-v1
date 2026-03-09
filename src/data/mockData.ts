export const USER_TYPES = [
  'Pilote', 'Copilote', 'Simracer', 'Fan', 'Coach', 'Mécanicien', 'Ingénieur',
  'Technicien', 'Manager', 'Personnel Médical', 'Médias Photo', 'Médias Vidéo',
  'Médias Presse', 'Personnel Organisation', 'Autre', 'Team', 'Entreprise/Marque'
] as const;

export const DISCIPLINES = [
  'Rally', 'Circuit', 'Montagne', 'Karting', 'Rallycross', 'Rallyraid',
  'Tout-terrain', 'Drift', 'Slalom', 'Régularité', 'Trial 4x4', 'Trackday', 'Simracing'
] as const;

export const REPORT_REASONS = ['Inapproprié / Non autorisé', 'Offensant', 'Autre motif'] as const;

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  user_type: string;
  disciplines: string[];
  country: string;
  country_flag: string;
  city: string;
  region: string;
  xp_score: number;
  status: 'active' | 'blocked' | 'deleted';
  created_at: string;
  last_login: string;
  birth_date: string;
  gender: string;
  start_year: number;
  races: number;
  victories: number;
  podiums: number;
  titles: number;
  followers: number;
  following: number;
  is_studio_subscriber: boolean;
  is_elite: boolean;
}

export interface Post {
  id: string;
  author_id: string;
  author_name: string;
  content_type: 'photo' | 'video' | 'text';
  text: string;
  media_url?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  reports_count: number;
  status: 'active' | 'reported' | 'deleted';
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  country: string;
  country_flag: string;
  city: string;
  address: string;
  phone: string;
  created_at: string;
  followers: number;
  posts_count: number;
  status: 'active' | 'blocked' | 'deleted';
  disciplines: string[];
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reported_user_id: string;
  reported_user_name: string;
  reported_user_email: string;
  content_type: 'post' | 'comment' | 'profile';
  content_id: string;
  content_preview: string;
  reason: string;
  free_text: string;
  status: 'pending' | 'resolved_rejected' | 'resolved_deleted' | 'resolved_warned';
  created_at: string;
  resolved_at?: string;
}

const firstNames = ['Lucas', 'Emma', 'Hugo', 'Chloé', 'Léo', 'Manon', 'Louis', 'Camille', 'Jules', 'Inès', 'Gabriel', 'Jade', 'Raphaël', 'Léa', 'Arthur', 'Louise', 'Théo', 'Alice', 'Noah', 'Lina'];
const lastNames = ['Martin', 'Bernard', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard', 'Bonnet', 'Dupont', 'Lambert', 'Fontaine', 'Rousseau'];
const countries = [
  { name: 'France', flag: '🇫🇷' }, { name: 'Belgique', flag: '🇧🇪' },
  { name: 'Suisse', flag: '🇨🇭' }, { name: 'Italie', flag: '🇮🇹' },
  { name: 'Espagne', flag: '🇪🇸' }, { name: 'Allemagne', flag: '🇩🇪' },
];
const cities = ['Paris', 'Lyon', 'Marseille', 'Bruxelles', 'Genève', 'Monaco', 'Spa', 'Monza', 'Barcelona', 'Nürburgring'];

function rand<T>(arr: readonly T[] | T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDate(yearStart: number, yearEnd: number) {
  const y = randInt(yearStart, yearEnd);
  const m = String(randInt(1, 12)).padStart(2, '0');
  const d = String(randInt(1, 28)).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => {
    const fn = rand(firstNames);
    const ln = rand(lastNames);
    const c = rand(countries);
    const numDisc = randInt(1, 3);
    const discs = [...new Set(Array.from({ length: numDisc }, () => rand(DISCIPLINES)))];
    return {
      id: `usr_${String(i + 1).padStart(5, '0')}`,
      first_name: fn,
      last_name: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`,
      user_type: rand(USER_TYPES.filter(t => t !== 'Entreprise/Marque')),
      disciplines: discs,
      country: c.name,
      country_flag: c.flag,
      city: rand(cities),
      region: 'Île-de-France',
      xp_score: randInt(100, 25000),
      status: Math.random() > 0.9 ? 'blocked' : 'active',
      created_at: randDate(2023, 2026),
      last_login: randDate(2025, 2026),
      birth_date: randDate(1980, 2005),
      gender: rand(['Homme', 'Femme', 'Autre']),
      start_year: randInt(2000, 2023),
      races: randInt(0, 200),
      victories: randInt(0, 30),
      podiums: randInt(0, 60),
      titles: randInt(0, 5),
      followers: randInt(10, 5000),
      following: randInt(5, 800),
      is_studio_subscriber: Math.random() > 0.7,
      is_elite: Math.random() > 0.85,
    };
  });
}

export function generatePosts(count: number, users: User[]): Post[] {
  const types: Post['content_type'][] = ['photo', 'video', 'text'];
  const texts = [
    'Session d\'essais incroyable aujourd\'hui sur le circuit!',
    'Nouveau record personnel sur le tour 🏎️',
    'Préparation mécanique pour le prochain rallye',
    'Podium ce weekend! Merci à toute l\'équipe 🏆',
    'Analyse télémétrie de la dernière course',
    'Nouvelle saison, nouvelles ambitions 💪',
    'Stage de pilotage avec les jeunes talents',
  ];
  return Array.from({ length: count }, (_, i) => {
    const author = rand(users);
    return {
      id: `post_${String(i + 1).padStart(5, '0')}`,
      author_id: author.id,
      author_name: `${author.first_name} ${author.last_name}`,
      content_type: rand(types),
      text: rand(texts),
      likes_count: randInt(0, 500),
      comments_count: randInt(0, 80),
      shares_count: randInt(0, 30),
      reports_count: Math.random() > 0.9 ? randInt(1, 5) : 0,
      status: Math.random() > 0.85 ? (Math.random() > 0.5 ? 'reported' : 'deleted') : 'active',
      created_at: randDate(2025, 2026),
    };
  });
}

export function generateCompanies(count: number): Company[] {
  const names = ['RaceTech Pro', 'Motorsport Solutions', 'Apex Racing', 'PitLane Parts', 'Circuit Masters', 'TurboForce', 'GripMax', 'SpeedCraft', 'Rally Dynamics', 'TrackVision', 'AutoPilot SA', 'Helm Systems'];
  return Array.from({ length: count }, (_, i) => {
    const c = rand(countries);
    return {
      id: `comp_${String(i + 1).padStart(4, '0')}`,
      name: names[i % names.length] + (i >= names.length ? ` ${i}` : ''),
      country: c.name,
      country_flag: c.flag,
      city: rand(cities),
      address: `${randInt(1, 200)} rue de la Victoire`,
      phone: `+33 ${randInt(1, 9)} ${randInt(10, 99)} ${randInt(10, 99)} ${randInt(10, 99)} ${randInt(10, 99)}`,
      created_at: randDate(2023, 2026),
      followers: randInt(50, 10000),
      posts_count: randInt(5, 500),
      status: Math.random() > 0.95 ? 'blocked' : 'active',
      disciplines: [...new Set(Array.from({ length: randInt(1, 3) }, () => rand(DISCIPLINES)))],
    };
  });
}

export function generateReports(count: number, users: User[]): Report[] {
  return Array.from({ length: count }, (_, i) => {
    const reporter = rand(users);
    const reported = rand(users.filter(u => u.id !== reporter.id));
    const reason = rand(REPORT_REASONS);
    const statusOpts: Report['status'][] = i < 8 ? ['pending'] : ['pending', 'resolved_rejected', 'resolved_deleted', 'resolved_warned'];
    return {
      id: `rpt_${String(i + 1).padStart(5, '0')}`,
      reporter_id: reporter.id,
      reporter_name: `${reporter.first_name} ${reporter.last_name}`,
      reported_user_id: reported.id,
      reported_user_name: `${reported.first_name} ${reported.last_name}`,
      reported_user_email: reported.email,
      content_type: rand(['post', 'comment', 'profile'] as const),
      content_id: `post_${String(randInt(1, 50)).padStart(5, '0')}`,
      content_preview: 'Contenu signalé par un utilisateur pour violation des conditions d\'utilisation.',
      reason,
      free_text: reason === 'Autre motif' ? 'Ce contenu ne respecte pas les règles de la communauté.' : '',
      status: rand(statusOpts),
      created_at: randDate(2025, 2026),
      resolved_at: undefined,
    };
  });
}

// Generate static data
export const mockUsers = generateUsers(120);
export const mockPosts = generatePosts(80, mockUsers);
export const mockCompanies = generateCompanies(25);
export const mockReports = generateReports(35, mockUsers);
