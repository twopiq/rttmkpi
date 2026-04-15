import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import bcrypt from 'bcryptjs'
import type { AuthUser } from './auth'

type SurveyAdminRow = {
  id: number
  name: string
  email: string
  login: string | null
  password: string
  role: string
}

type SurveyAdminAuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; message: string }
  | null

const resolveSqlitePath = () => {
  const config = useRuntimeConfig()
  const configuredPath = String(config.surveySqlitePath || '').trim()

  if (!configuredPath) {
    return null
  }

  return resolve(process.cwd(), configuredPath)
}

const findAdminByIdentifier = (db: DatabaseSync, identifier: string) => {
  return db.prepare(`
    select
      users.id,
      users.name,
      users.email,
      users.login,
      users.password,
      roles.name as role
    from users
    inner join model_has_roles on model_has_roles.model_id = users.id
    inner join roles on roles.id = model_has_roles.role_id
    where roles.name = 'admin'
      and users.is_active = 1
      and (
        lower(users.email) = lower(?)
        or lower(coalesce(users.login, '')) = lower(?)
      )
    limit 1
  `).get(identifier, identifier) as SurveyAdminRow | undefined
}

export const authenticateSurveyAdmin = (identifier: string, password: string): SurveyAdminAuthResult => {
  const sqlitePath = resolveSqlitePath()

  if (!sqlitePath || !existsSync(sqlitePath)) {
    return null
  }

  const db = new DatabaseSync(sqlitePath, {
    readOnly: true,
  })

  try {
    const admin = findAdminByIdentifier(db, identifier.trim())

    if (!admin) {
      return {
        ok: false,
        message: 'Faqat so\'rovnoma tizimidagi admin foydalanuvchi kira oladi',
      }
    }

    if (!bcrypt.compareSync(password, admin.password)) {
      return {
        ok: false,
        message: "Login yoki parol noto'g'ri",
      }
    }

    return {
      ok: true,
      user: {
        id: String(admin.id),
        name: admin.name,
        login: admin.email || admin.login || identifier,
        role: admin.role,
        source: 'survey-sqlite',
      },
    }
  } finally {
    db.close()
  }
}
