import type { Site, SiteMovement } from "../../types"

export function toLocalDateKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function startOfDayLocal(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function isSameLocalDay(a: Date | string, b: Date | string): boolean {
  return toLocalDateKey(a) === toLocalDateKey(b)
}

export function isWithinDays(date: Date | string, days: number): boolean {
  const target = startOfDayLocal(new Date(date))
  const from = startOfDayLocal(new Date())
  from.setDate(from.getDate() - (days - 1))
  return target >= from
}

export function sortMovementByDate(
  a: SiteMovement,
  b: SiteMovement,
): number {
  const diff = new Date(a.date).getTime() - new Date(b.date).getTime()
  if (diff !== 0) return diff
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
}

export function computeSiteBalance(
  initialBalance: number,
  movements: SiteMovement[],
): number {
  return movements.reduce(
    (acc, m) => acc + (m.type === "earn" ? m.amount : -m.amount),
    initialBalance,
  )
}

/**
 * Recalculates the current balance of each site and the `balanceAfter` of each
 * movement (balance at the time of the record), respecting the chronological
 * order of the records.
 */
export function recomputeSiteBalances(
  sites: Site[],
  movements: SiteMovement[],
): { sites: Site[]; movements: SiteMovement[] } {
  const updatedMovements = movements.map((m) => ({ ...m }))

  const updatedSites = sites.map((site) => {
    const siteMoves = movements
      .filter((m) => m.siteId === site.id)
      .sort(sortMovementByDate)

    let running = site.initialBalance
    for (const m of siteMoves) {
      running += m.type === "earn" ? m.amount : -m.amount
      const record = updatedMovements.find((u) => u.id === m.id)
      if (record) record.balanceAfter = Number(running.toFixed(2))
    }

    return { ...site, balance: Number(running.toFixed(2)) }
  })

  return { sites: updatedSites, movements: updatedMovements }
}

export interface SiteSummary {
  totalBalance: number
  earningsToday: number
  withdrawalsTotal: number
  activeSites: number
  today: number
  yesterday: number
  last7d: number
  last30d: number
}

export function computeSiteSummary(
  sites: Site[],
  movements: SiteMovement[],
): SiteSummary {
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const today = movements
    .filter((m) => m.type === "earn" && isSameLocalDay(m.date, now))
    .reduce((acc, m) => acc + m.amount, 0)

  const yest = movements
    .filter((m) => m.type === "earn" && isSameLocalDay(m.date, yesterday))
    .reduce((acc, m) => acc + m.amount, 0)

  const earnings = movements.filter((m) => m.type === "earn")
  const last7d = earnings
    .filter((m) => isWithinDays(m.date, 7))
    .reduce((acc, m) => acc + m.amount, 0)
  const last30d = earnings
    .filter((m) => isWithinDays(m.date, 30))
    .reduce((acc, m) => acc + m.amount, 0)

  const withdrawalsTotal = movements
    .filter((m) => m.type === "withdraw")
    .reduce((acc, m) => acc + m.amount, 0)

  return {
    totalBalance: sites.reduce((acc, s) => acc + s.balance, 0),
    earningsToday: today,
    withdrawalsTotal,
    activeSites: sites.filter((s) => s.status === "active").length,
    today,
    yesterday: yest,
    last7d,
    last30d,
  }
}

export interface SiteRowStats {
  today: number
  yesterday: number
  withdrawn: number
}

export function computeSiteRowStats(
  movements: SiteMovement[],
  siteId: string,
): SiteRowStats {
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const siteMoves = movements.filter((m) => m.siteId === siteId)
  let today = 0
  let yest = 0
  let withdrawn = 0

  for (const m of siteMoves) {
    if (m.type === "withdraw") {
      withdrawn += m.amount
      continue
    }
    if (isSameLocalDay(m.date, now)) today += m.amount
    else if (isSameLocalDay(m.date, yesterday)) yest += m.amount
  }

  return { today, yesterday: yest, withdrawn }
}

export interface DailyGainPoint {
  key: string
  label: string
  gains: number
  withdrawn: number
}

const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
})

export function buildDailyGainsChart(
  movements: SiteMovement[],
  days: number = 30,
): DailyGainPoint[] {
  const byDay = new Map<string, { gains: number; withdrawn: number }>()

  const today = startOfDayLocal(new Date())
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today)
    day.setDate(day.getDate() - i)
    byDay.set(toLocalDateKey(day), { gains: 0, withdrawn: 0 })
  }

  for (const m of movements) {
    if (!isWithinDays(m.date, days)) continue
    const key = toLocalDateKey(m.date)
    const bucket = byDay.get(key)
    if (!bucket) continue
    if (m.type === "earn") bucket.gains += m.amount
    else bucket.withdrawn += m.amount
  }

  const points: DailyGainPoint[] = []
  for (const [key, value] of byDay) {
    const date = new Date(key + "T12:00:00")
    points.push({
      key,
      label: DAY_LABEL_FORMATTER.format(date),
      gains: Number(value.gains.toFixed(2)),
      withdrawn: Number(value.withdrawn.toFixed(2)),
    })
  }

  return points
}
