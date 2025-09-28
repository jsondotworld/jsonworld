import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { format, resolveConfig } from 'prettier'

export async function writeData(
	importUrl: string,
	basename: string,
	object: {
		source: string
		timestamp: string
		data: object
	}
) {
	const dir = dirname(fileURLToPath(importUrl))
	const options = await resolveConfig(dir)
	const hasExpected = existsSync(join(dir, 'expected.d.ts'))

	const { data, ...meta } = object
	let typescriptCode =
		(hasExpected ? 'import { Expected } from "./expected.js"\n\n' : '') +
		`export const meta = ${JSON.stringify(meta)} as const\n\n` +
		`export const data = ${JSON.stringify(data)} as const` +
		(hasExpected ? ' satisfies Expected' : '')

	const [formattedJson, formattedTypescript] = await Promise.all([
		format(JSON.stringify(object), { ...options, parser: 'json' }),
		format(typescriptCode, { ...options, parser: 'typescript' }),
	])

	return Promise.all([
		writeFile(join(dir, `${basename}.json`), formattedJson),
		writeFile(join(dir, `${basename}.ts`), formattedTypescript),
	])
}
