import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { format, resolveConfig } from 'prettier'

export async function writeData(
	importUrl: string,
	basename: string,
	data: object
) {
	const dir = dirname(fileURLToPath(importUrl))
	const options = await resolveConfig(dir)

	const jsonString = JSON.stringify(data)
	const typescriptCode = `export default ${jsonString} as const`

	const [formattedJson, formattedTypescript] = await Promise.all([
		format(jsonString, { ...options, parser: 'json' }),
		format(typescriptCode, { ...options, parser: 'typescript' }),
	])

	return Promise.all([
		writeFile(join(dir, `${basename}.json`), formattedJson),
		writeFile(join(dir, `${basename}.ts`), formattedTypescript),
	])
}
