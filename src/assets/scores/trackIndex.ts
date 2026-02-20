import type { DifficultyLevel } from '@/engines/DifficultyCalculator'

export interface TrackMeta {
  id: string
  title: string
  composer: string
  instrument: 'piano' | 'cello'
  difficulty: DifficultyLevel
  difficultyScore: number
  durationSeconds: number
  measures: number
  tags: string[]
  xmlPath: string
  midiPath?: string
}

export const pianoTracks: TrackMeta[] = [
  // Beginner
  { id: 'p001', title: 'Twinkle Twinkle Little Star', composer: 'Traditional', instrument: 'piano', difficulty: 'beginner', difficultyScore: 1, durationSeconds: 60, measures: 24, tags: ['children', 'folk'], xmlPath: 'piano/twinkle.xml' },
  { id: 'p002', title: 'Ode to Joy', composer: 'L. van Beethoven', instrument: 'piano', difficulty: 'beginner', difficultyScore: 2, durationSeconds: 45, measures: 16, tags: ['classical'], xmlPath: 'piano/ode-to-joy.xml' },
  { id: 'p003', title: 'Mary Had a Little Lamb', composer: 'Traditional', instrument: 'piano', difficulty: 'beginner', difficultyScore: 1, durationSeconds: 30, measures: 16, tags: ['children', 'folk'], xmlPath: 'piano/mary-lamb.xml' },
  { id: 'p004', title: 'Jingle Bells', composer: 'J. Pierpont', instrument: 'piano', difficulty: 'beginner', difficultyScore: 2, durationSeconds: 50, measures: 20, tags: ['holiday'], xmlPath: 'piano/jingle-bells.xml' },
  { id: 'p005', title: 'London Bridge', composer: 'Traditional', instrument: 'piano', difficulty: 'beginner', difficultyScore: 1, durationSeconds: 25, measures: 12, tags: ['children', 'folk'], xmlPath: 'piano/london-bridge.xml' },
  { id: 'p006', title: 'Happy Birthday', composer: 'Traditional', instrument: 'piano', difficulty: 'beginner', difficultyScore: 2, durationSeconds: 20, measures: 8, tags: ['popular'], xmlPath: 'piano/happy-birthday.xml' },
  { id: 'p007', title: 'Aura Lee', composer: 'G. Poulton', instrument: 'piano', difficulty: 'beginner', difficultyScore: 2, durationSeconds: 40, measures: 16, tags: ['folk'], xmlPath: 'piano/aura-lee.xml' },
  // Intermediate
  { id: 'p008', title: 'Minuet in G Major', composer: 'J.S. Bach', instrument: 'piano', difficulty: 'intermediate', difficultyScore: 4, durationSeconds: 90, measures: 32, tags: ['classical', 'baroque'], xmlPath: 'piano/minuet-g.xml' },
  { id: 'p009', title: 'Für Elise', composer: 'L. van Beethoven', instrument: 'piano', difficulty: 'intermediate', difficultyScore: 5, durationSeconds: 180, measures: 103, tags: ['classical', 'romantic'], xmlPath: 'piano/fur-elise.xml' },
  { id: 'p010', title: 'Prelude in C Major BWV 846', composer: 'J.S. Bach', instrument: 'piano', difficulty: 'intermediate', difficultyScore: 5, durationSeconds: 150, measures: 35, tags: ['classical', 'baroque'], xmlPath: 'piano/prelude-c.xml' },
  { id: 'p011', title: 'Sonatina Op.36 No.1', composer: 'M. Clementi', instrument: 'piano', difficulty: 'intermediate', difficultyScore: 4, durationSeconds: 120, measures: 38, tags: ['classical'], xmlPath: 'piano/sonatina-op36-1.xml' },
  { id: 'p012', title: 'Arabesque No.1', composer: 'J.F. Burgmüller', instrument: 'piano', difficulty: 'intermediate', difficultyScore: 4, durationSeconds: 60, measures: 24, tags: ['classical', 'etude'], xmlPath: 'piano/arabesque.xml' },
  { id: 'p013', title: 'Musette in D Major', composer: 'J.S. Bach', instrument: 'piano', difficulty: 'intermediate', difficultyScore: 3, durationSeconds: 50, measures: 24, tags: ['classical', 'baroque'], xmlPath: 'piano/musette-d.xml' },
  { id: 'p014', title: 'Waltz in A minor', composer: 'F. Chopin', instrument: 'piano', difficulty: 'intermediate', difficultyScore: 5, durationSeconds: 120, measures: 48, tags: ['classical', 'romantic'], xmlPath: 'piano/waltz-am.xml' },
  // Advanced
  { id: 'p015', title: 'Moonlight Sonata Mvt.1', composer: 'L. van Beethoven', instrument: 'piano', difficulty: 'advanced', difficultyScore: 7, durationSeconds: 360, measures: 69, tags: ['classical', 'sonata'], xmlPath: 'piano/moonlight-1.xml' },
  { id: 'p016', title: 'Invention No.1 in C Major', composer: 'J.S. Bach', instrument: 'piano', difficulty: 'advanced', difficultyScore: 7, durationSeconds: 90, measures: 22, tags: ['classical', 'baroque'], xmlPath: 'piano/invention-1.xml' },
  { id: 'p017', title: 'Rondo Alla Turca', composer: 'W.A. Mozart', instrument: 'piano', difficulty: 'advanced', difficultyScore: 8, durationSeconds: 210, measures: 127, tags: ['classical'], xmlPath: 'piano/rondo-turca.xml' },
  { id: 'p018', title: 'Fantaisie-Impromptu', composer: 'F. Chopin', instrument: 'piano', difficulty: 'advanced', difficultyScore: 9, durationSeconds: 300, measures: 180, tags: ['classical', 'romantic'], xmlPath: 'piano/fantaisie-impromptu.xml' },
  { id: 'p019', title: 'Clair de Lune', composer: 'C. Debussy', instrument: 'piano', difficulty: 'advanced', difficultyScore: 8, durationSeconds: 300, measures: 72, tags: ['classical', 'impressionist'], xmlPath: 'piano/clair-de-lune.xml' },
  { id: 'p020', title: 'Gymnopédie No.1', composer: 'E. Satie', instrument: 'piano', difficulty: 'advanced', difficultyScore: 7, durationSeconds: 180, measures: 39, tags: ['classical', 'impressionist'], xmlPath: 'piano/gymnopedie-1.xml' },
]

export const celloTracks: TrackMeta[] = [
  // Beginner
  { id: 'c001', title: 'Twinkle Twinkle (Cello)', composer: 'Traditional', instrument: 'cello', difficulty: 'beginner', difficultyScore: 1, durationSeconds: 60, measures: 24, tags: ['children', 'suzuki'], xmlPath: 'cello/twinkle.xml' },
  { id: 'c002', title: 'Lightly Row', composer: 'Traditional', instrument: 'cello', difficulty: 'beginner', difficultyScore: 1, durationSeconds: 40, measures: 16, tags: ['folk', 'suzuki'], xmlPath: 'cello/lightly-row.xml' },
  { id: 'c003', title: 'Go Tell Aunt Rhody', composer: 'Traditional', instrument: 'cello', difficulty: 'beginner', difficultyScore: 2, durationSeconds: 30, measures: 16, tags: ['folk', 'suzuki'], xmlPath: 'cello/aunt-rhody.xml' },
  { id: 'c004', title: 'May Song', composer: 'Traditional', instrument: 'cello', difficulty: 'beginner', difficultyScore: 2, durationSeconds: 35, measures: 16, tags: ['folk', 'suzuki'], xmlPath: 'cello/may-song.xml' },
  { id: 'c005', title: 'Long Long Ago', composer: 'T.H. Bayly', instrument: 'cello', difficulty: 'beginner', difficultyScore: 2, durationSeconds: 45, measures: 16, tags: ['folk', 'suzuki'], xmlPath: 'cello/long-long-ago.xml' },
  // Intermediate
  { id: 'c006', title: 'Minuet No.1', composer: 'J.S. Bach', instrument: 'cello', difficulty: 'intermediate', difficultyScore: 4, durationSeconds: 60, measures: 24, tags: ['classical', 'suzuki'], xmlPath: 'cello/minuet-1.xml' },
  { id: 'c007', title: 'Minuet No.2', composer: 'J.S. Bach', instrument: 'cello', difficulty: 'intermediate', difficultyScore: 4, durationSeconds: 70, measures: 28, tags: ['classical', 'suzuki'], xmlPath: 'cello/minuet-2.xml' },
  { id: 'c008', title: 'Minuet No.3', composer: 'J.S. Bach', instrument: 'cello', difficulty: 'intermediate', difficultyScore: 5, durationSeconds: 80, measures: 32, tags: ['classical', 'suzuki'], xmlPath: 'cello/minuet-3.xml' },
  { id: 'c009', title: 'Gavotte', composer: 'F.J. Gossec', instrument: 'cello', difficulty: 'intermediate', difficultyScore: 5, durationSeconds: 90, measures: 32, tags: ['classical'], xmlPath: 'cello/gavotte.xml' },
  { id: 'c010', title: 'Allegro', composer: 'S. Suzuki', instrument: 'cello', difficulty: 'intermediate', difficultyScore: 5, durationSeconds: 60, measures: 24, tags: ['classical', 'suzuki'], xmlPath: 'cello/allegro.xml' },
  // Advanced
  { id: 'c011', title: 'Suite No.1 Prelude', composer: 'J.S. Bach', instrument: 'cello', difficulty: 'advanced', difficultyScore: 8, durationSeconds: 150, measures: 42, tags: ['classical', 'baroque'], xmlPath: 'cello/suite1-prelude.xml' },
  { id: 'c012', title: 'Suite No.1 Allemande', composer: 'J.S. Bach', instrument: 'cello', difficulty: 'advanced', difficultyScore: 8, durationSeconds: 240, measures: 32, tags: ['classical', 'baroque'], xmlPath: 'cello/suite1-allemande.xml' },
  { id: 'c013', title: 'Suite No.1 Courante', composer: 'J.S. Bach', instrument: 'cello', difficulty: 'advanced', difficultyScore: 9, durationSeconds: 180, measures: 42, tags: ['classical', 'baroque'], xmlPath: 'cello/suite1-courante.xml' },
  { id: 'c014', title: 'The Swan', composer: 'C. Saint-Saëns', instrument: 'cello', difficulty: 'advanced', difficultyScore: 7, durationSeconds: 180, measures: 28, tags: ['classical', 'romantic'], xmlPath: 'cello/the-swan.xml' },
  { id: 'c015', title: 'Élégie', composer: 'G. Fauré', instrument: 'cello', difficulty: 'advanced', difficultyScore: 8, durationSeconds: 360, measures: 80, tags: ['classical', 'romantic'], xmlPath: 'cello/elegie.xml' },
]

export const allTracks: TrackMeta[] = [...pianoTracks, ...celloTracks]
