import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const SPREADSHEET_RELATIVE_PATH = path.join(
  'docs',
  'reference',
  'janus-feature-user-story-status.csv'
)
const REQUIRED_COLUMNS = [
  'id',
  'kind',
  'feature',
  'user_story',
  'expected_behavior',
  'code_evidence',
  'test_evidence',
  'status',
  'last_tested',
  'defects'
]

function parseCsvLine(line) {
  const cells = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"'
        index += 1
      } else {
        quoted = !quoted
      }
      continue
    }
    if (char === ',' && !quoted) {
      cells.push(cell)
      cell = ''
      continue
    }
    cell += char
  }

  cells.push(cell)
  return cells
}

function parseCsv(text) {
  const lines = text.trimEnd().split(/\r?\n/)
  const headers = parseCsvLine(lines[0] ?? '')
  return {
    headers,
    rows: lines.slice(1).map((line, index) => {
      const values = parseCsvLine(line)
      return {
        line: index + 2,
        values,
        record: Object.fromEntries(
          headers.map((header, valueIndex) => [header, values[valueIndex] ?? ''])
        )
      }
    })
  }
}

import { collectExpectedRows } from './feature-user-story-status-collectors.mjs'

function validateRequiredColumns(headers) {
  const headerSet = new Set(headers)
  return REQUIRED_COLUMNS.filter((column) => !headerSet.has(column))
}

function validateRows(rows) {
  const errors = []
  const seen = new Map()

  for (const row of rows) {
    const id = row.record.id
    if (!id) {
      errors.push(`Line ${row.line} is missing id.`)
      continue
    }
    if (seen.has(id)) {
      errors.push(`Duplicate spreadsheet id ${id} on lines ${seen.get(id)} and ${row.line}.`)
    } else {
      seen.set(id, row.line)
    }

    for (const column of REQUIRED_COLUMNS.filter((name) => name !== 'defects')) {
      if (!row.record[column]) {
        errors.push(`Line ${row.line} is missing ${column}.`)
      }
    }
  }

  return { errors, ids: new Set(seen.keys()) }
}

export async function main(root = process.cwd()) {
  const spreadsheetPath = path.join(root, SPREADSHEET_RELATIVE_PATH)
  let text
  try {
    text = await fs.readFile(spreadsheetPath, 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') {
      console.error(
        `Missing canonical feature user-story spreadsheet: ${SPREADSHEET_RELATIVE_PATH}`
      )
      return 1
    }
    throw error
  }

  const { headers, rows } = parseCsv(text)
  const errors = []
  const missingColumns = validateRequiredColumns(headers)
  if (missingColumns.length > 0) {
    errors.push(`Missing spreadsheet column(s): ${missingColumns.join(', ')}`)
  }

  const rowValidation = validateRows(rows)
  errors.push(...rowValidation.errors)

  const expectedIds = await collectExpectedRows(root)
  const missingIds = expectedIds.filter((id) => !rowValidation.ids.has(id))
  if (missingIds.length > 0) {
    errors.push(`Missing code-backed feature row(s): ${missingIds.join(', ')}`)
  }

  if (errors.length > 0) {
    console.error(errors.join('\n'))
    return 1
  }

  console.log(`Verified ${rows.length} canonical feature user-story row(s).`)
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await main())
}
