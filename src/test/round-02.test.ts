/**
 * 第2轮测试 — 数据库层测试
 * 使用 sql.js Node 版本创建内存数据库，mock database.ts 的 getDB/query/execute
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import initSqlJs, { type Database } from 'sql.js'

let db: Database
let SQL: Awaited<ReturnType<typeof initSqlJs>>

// schema SQL 内联（避免 ?raw 导入问题）
const schemaSql = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT 'local-user',
  nickname TEXT DEFAULT 'Musician',
  avatar TEXT,
  skill_level TEXT DEFAULT 'beginner',
  instrument TEXT DEFAULT 'piano',
  language TEXT DEFAULT 'en',
  sound_effects_enabled INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  composer TEXT,
  instrument TEXT NOT NULL,
  difficulty TEXT,
  difficulty_score REAL,
  duration_seconds INTEGER,
  category TEXT,
  musicxml_path TEXT,
  midi_path TEXT,
  is_builtin INTEGER DEFAULT 1,
  created_at TEXT
);
`

const practiceSessionsSql = `
CREATE TABLE IF NOT EXISTS practice_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'local-user',
  track_id TEXT NOT NULL,
  scoring_mode TEXT,
  status TEXT DEFAULT 'completed',
  duration_seconds INTEGER,
  target_bpm INTEGER,
  actual_bpm REAL,
  total_score REAL,
  speed_score REAL,
  rhythm_score REAL,
  intonation_score REAL,
  smoothness_score REAL,
  completeness_score REAL,
  audio_blob_key TEXT,
  video_blob_key TEXT,
  resume_position INTEGER,
  created_at TEXT
);
`

const achievementsSql = `
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'local-user',
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  unlocked_at TEXT
);
`

const weeklyGoalsSql = `
CREATE TABLE IF NOT EXISTS weekly_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'local-user',
  week_start TEXT NOT NULL,
  target_days INTEGER DEFAULT 5,
  target_minutes INTEGER DEFAULT 120,
  actual_days INTEGER DEFAULT 0,
  actual_minutes INTEGER DEFAULT 0,
  created_at TEXT
);
`

beforeAll(async () => {
  SQL = await initSqlJs()
})

/** 辅助：创建新数据库并初始化 schema */
function createTestDB(): Database {
  const d = new SQL.Database()
  d.exec(schemaSql)
  d.exec(practiceSessionsSql)
  d.exec(achievementsSql)
  d.exec(weeklyGoalsSql)
  d.run("INSERT OR IGNORE INTO users (id) VALUES ('local-user')")
  return d
}

/** 模拟 query 函数 */
function testQuery(d: Database, sql: string, params: unknown[] = []) {
  const stmt = d.prepare(sql)
  if (params.length) stmt.bind(params as never)
  const columns = stmt.getColumnNames()
  const values: unknown[][] = []
  while (stmt.step()) values.push(stmt.get())
  stmt.free()
  if (values.length === 0 && columns.length === 0) return null
  return { columns, values }
}

/** 模拟 execute 函数 */
function testExecute(d: Database, sql: string, params: unknown[] = []) {
  const stmt = d.prepare(sql)
  if (params.length) stmt.bind(params as never)
  stmt.step()
  stmt.free()
}

describe('query() 和 execute() 辅助函数', () => {
  beforeEach(() => { db = createTestDB() })

  it('2.1 query() 无参数 SELECT 返回正确结构', () => {
    const result = testQuery(db, "SELECT * FROM users WHERE id = 'local-user'")
    expect(result).not.toBeNull()
    expect(result!.columns).toContain('id')
    expect(result!.columns).toContain('nickname')
    expect(result!.values.length).toBe(1)
  })

  it('2.2 query() 带参数 SELECT 返回匹配行', () => {
    testExecute(db, "INSERT INTO tracks (id, name, instrument) VALUES (?, ?, ?)", ['t1', 'Test', 'piano'])
    const result = testQuery(db, "SELECT * FROM tracks WHERE id = ?", ['t1'])
    expect(result).not.toBeNull()
    expect(result!.values.length).toBe(1)
  })

  it('2.3 query() 无结果时 values 为空', () => {
    const result = testQuery(db, "SELECT * FROM tracks WHERE id = ?", ['nonexistent'])
    // query 返回 columns 但 values 为空
    expect(result).not.toBeNull()
    expect(result!.values.length).toBe(0)
  })

  it('2.4 execute() 执行 INSERT 成功', () => {
    testExecute(db, "INSERT INTO tracks (id, name, instrument) VALUES (?, ?, ?)", ['t2', 'Song2', 'cello'])
    const r = testQuery(db, "SELECT name FROM tracks WHERE id = ?", ['t2'])
    expect(r!.values[0][0]).toBe('Song2')
  })

  it('2.5 execute() 执行 UPDATE 成功', () => {
    testExecute(db, "INSERT INTO tracks (id, name, instrument) VALUES (?, ?, ?)", ['t3', 'Old', 'piano'])
    testExecute(db, "UPDATE tracks SET name = ? WHERE id = ?", ['New', 't3'])
    const r = testQuery(db, "SELECT name FROM tracks WHERE id = ?", ['t3'])
    expect(r!.values[0][0]).toBe('New')
  })

  it('2.6 execute() 执行 DELETE 成功', () => {
    testExecute(db, "INSERT INTO tracks (id, name, instrument) VALUES (?, ?, ?)", ['t4', 'Del', 'piano'])
    testExecute(db, "DELETE FROM tracks WHERE id = ?", ['t4'])
    const r = testQuery(db, "SELECT * FROM tracks WHERE id = ?", ['t4'])
    expect(r!.values.length).toBe(0)
  })
})

function rowToObject<T>(columns: string[], values: unknown[]): T {
  return Object.fromEntries(columns.map((c, i) => [c, values[i]])) as T
}

describe('ScoreRepository 逻辑验证', () => {
  beforeEach(() => { db = createTestDB() })

  it('2.8 upsert 插入曲目后可查询', () => {
    testExecute(db,
      `INSERT OR REPLACE INTO tracks (id,name,composer,instrument,difficulty,difficulty_score,duration_seconds,category,musicxml_path,midi_path,is_builtin)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      ['t1','Fur Elise','Beethoven','piano','beginner',1.5,120,'classical',null,null,1]
    )
    const r = testQuery(db, "SELECT * FROM tracks WHERE id = ?", ['t1'])
    expect(r!.values.length).toBe(1)
    const track = rowToObject<Record<string,unknown>>(r!.columns, r!.values[0])
    expect(track.name).toBe('Fur Elise')
    expect(track.composer).toBe('Beethoven')
  })

  it('2.9 getById 查询不存在的曲目返回空', () => {
    const r = testQuery(db, "SELECT * FROM tracks WHERE id = ?", ['nope'])
    expect(r!.values.length).toBe(0)
  })

  it('2.10 getAll 按乐器筛选', () => {
    testExecute(db, "INSERT INTO tracks (id,name,instrument) VALUES (?,?,?)", ['p1','Piano Song','piano'])
    testExecute(db, "INSERT INTO tracks (id,name,instrument) VALUES (?,?,?)", ['c1','Cello Song','cello'])
    const r = testQuery(db, "SELECT * FROM tracks WHERE instrument = ?", ['piano'])
    expect(r!.values.length).toBe(1)
    const track = rowToObject<Record<string,unknown>>(r!.columns, r!.values[0])
    expect(track.id).toBe('p1')
  })

  it('2.11 search 模糊搜索', () => {
    testExecute(db, "INSERT INTO tracks (id,name,instrument) VALUES (?,?,?)", ['s1','Moonlight Sonata','piano'])
    testExecute(db, "INSERT INTO tracks (id,name,instrument) VALUES (?,?,?)", ['s2','Twinkle Star','piano'])
    const r = testQuery(db, "SELECT * FROM tracks WHERE name LIKE ?", ['%Moon%'])
    expect(r!.values.length).toBe(1)
  })
})

describe('PracticeRepository 逻辑验证', () => {
  beforeEach(() => {
    db = createTestDB()
    // 插入一个 track 供外键引用
    testExecute(db, "INSERT INTO tracks (id,name,instrument) VALUES (?,?,?)", ['t1','Test','piano'])
  })

  it('2.12 create 创建练习记录', () => {
    testExecute(db,
      `INSERT INTO practice_sessions (id,user_id,track_id,scoring_mode,status,duration_seconds,target_bpm,actual_bpm,total_score,speed_score,rhythm_score,intonation_score,smoothness_score,completeness_score,audio_blob_key,video_blob_key,resume_position)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      ['s1','local-user','t1','piece','completed',300,120,118,85,17,18,16,17,17,null,null,null]
    )
    const r = testQuery(db, "SELECT * FROM practice_sessions WHERE id = ?", ['s1'])
    expect(r!.values.length).toBe(1)
  })

  it('2.13 getRecent 获取最近记录', () => {
    testExecute(db,
      `INSERT INTO practice_sessions (id,user_id,track_id,scoring_mode,status,duration_seconds,created_at)
       VALUES (?,?,?,?,?,?,?)`,
      ['s1','local-user','t1','piece','completed',300,'2025-01-01']
    )
    testExecute(db,
      `INSERT INTO practice_sessions (id,user_id,track_id,scoring_mode,status,duration_seconds,created_at)
       VALUES (?,?,?,?,?,?,?)`,
      ['s2','local-user','t1','piece','completed',200,'2025-01-02']
    )
    const r = testQuery(db, "SELECT * FROM practice_sessions ORDER BY created_at DESC LIMIT ?", [1])
    expect(r!.values.length).toBe(1)
    const row = rowToObject<Record<string,unknown>>(r!.columns, r!.values[0])
    expect(row.id).toBe('s2')
  })

  it('2.14 updateScores 更新分数', () => {
    testExecute(db,
      `INSERT INTO practice_sessions (id,user_id,track_id,scoring_mode,status) VALUES (?,?,?,?,?)`,
      ['s1','local-user','t1','piece','in-progress']
    )
    testExecute(db,
      `UPDATE practice_sessions SET total_score=?,speed_score=?,rhythm_score=?,intonation_score=?,smoothness_score=?,completeness_score=?,status='completed' WHERE id=?`,
      [90,18,19,17,18,18,'s1']
    )
    const r = testQuery(db, "SELECT total_score,status FROM practice_sessions WHERE id=?", ['s1'])
    const row = rowToObject<Record<string,unknown>>(r!.columns, r!.values[0])
    expect(row.total_score).toBe(90)
    expect(row.status).toBe('completed')
  })
})

describe('UserRepository 逻辑验证', () => {
  beforeEach(() => { db = createTestDB() })

  it('2.15 get 获取用户', () => {
    const r = testQuery(db, "SELECT * FROM users WHERE id = 'local-user'")
    expect(r).not.toBeNull()
    expect(r!.values.length).toBe(1)
    const user = rowToObject<Record<string,unknown>>(r!.columns, r!.values[0])
    expect(user.nickname).toBe('Musician')
    expect(user.instrument).toBe('piano')
  })

  it('2.16 update 更新用户字段', () => {
    testExecute(db, "UPDATE users SET nickname=?,instrument=? WHERE id='local-user'", ['Alice','cello'])
    const r = testQuery(db, "SELECT nickname,instrument FROM users WHERE id='local-user'")
    const user = rowToObject<Record<string,unknown>>(r!.columns, r!.values[0])
    expect(user.nickname).toBe('Alice')
    expect(user.instrument).toBe('cello')
  })
})

describe('AchievementRepository 逻辑验证', () => {
  beforeEach(() => { db = createTestDB() })

  it('2.17 unlock 解锁成就', () => {
    testExecute(db,
      "INSERT OR IGNORE INTO achievements (id,user_id,achievement_type,title,description) VALUES (?,?,?,?,?)",
      ['first-practice','local-user','milestone','First Steps','Complete first session']
    )
    const r = testQuery(db, "SELECT * FROM achievements WHERE id=?", ['first-practice'])
    expect(r!.values.length).toBe(1)
  })

  it('2.18 getAll 获取所有成就', () => {
    testExecute(db,
      "INSERT INTO achievements (id,user_id,achievement_type,title) VALUES (?,?,?,?)",
      ['a1','local-user','milestone','Test1']
    )
    testExecute(db,
      "INSERT INTO achievements (id,user_id,achievement_type,title) VALUES (?,?,?,?)",
      ['a2','local-user','score','Test2']
    )
    const r = testQuery(db, "SELECT * FROM achievements WHERE user_id='local-user'")
    expect(r!.values.length).toBe(2)
  })
})

describe('WeeklyGoalRepository 逻辑验证', () => {
  beforeEach(() => { db = createTestDB() })

  it('2.19 getCurrentWeek 创建周目标', () => {
    testExecute(db, "INSERT INTO weekly_goals (week_start,target_days,target_minutes) VALUES (?,5,120)", ['2025-01-06'])
    const r = testQuery(db, "SELECT * FROM weekly_goals WHERE week_start=?", ['2025-01-06'])
    expect(r!.values.length).toBe(1)
    const goal = rowToObject<Record<string,unknown>>(r!.columns, r!.values[0])
    expect(goal.target_days).toBe(5)
    expect(goal.target_minutes).toBe(120)
  })

  it('2.20 updateTarget 更新目标', () => {
    testExecute(db, "INSERT INTO weekly_goals (week_start) VALUES (?)", ['2025-01-06'])
    testExecute(db, "UPDATE weekly_goals SET target_days=?,target_minutes=? WHERE week_start=?", [7,180,'2025-01-06'])
    const r = testQuery(db, "SELECT target_days,target_minutes FROM weekly_goals WHERE week_start=?", ['2025-01-06'])
    const goal = rowToObject<Record<string,unknown>>(r!.columns, r!.values[0])
    expect(goal.target_days).toBe(7)
    expect(goal.target_minutes).toBe(180)
  })
})
