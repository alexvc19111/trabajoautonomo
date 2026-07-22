import { execSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'

const RS = '\x1e'
const US = '\x1f'

const raw = execSync(
  `git log -n 15 --date=format:"%d/%m/%Y %H:%M" --pretty=format:"%h${US}%an${US}%ad${US}%s${RS}"`,
  { encoding: 'utf8' }
)

const commits = raw
  .split(RS)
  .map((entry) => entry.replace(/^\n/, '').trim())
  .filter(Boolean)
  .map((entry) => {
    const [hash, author, date, ...msgParts] = entry.split(US)
    return { hash, author, date, msg: msgParts.join(US) }
  })

mkdirSync('public', { recursive: true })
writeFileSync('public/history.json', JSON.stringify(commits, null, 2))
console.log(`Generado public/history.json con ${commits.length} commits reales`)
