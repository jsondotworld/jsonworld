import { JSDOM } from 'jsdom'
import { assert, isNotUndefined } from 'typed-assert'
import { writeData } from '../utils/writeData.js'

async function main() {
	const source = 'https://en.wikipedia.org/wiki/List_of_telephone_country_codes'

	const response = await fetch(source)
	assert(response.ok, `Could not fetch HTML: ${response.status}`)
	const html = await response.text()

	const dom = new JSDOM(html)
	const document = dom.window.document

	const tables = document.querySelectorAll('table.wikitable')
	const table = Array.from(tables).find((table) =>
		table.textContent.includes('x = 0')
	)
	isNotUndefined(table)

	const matches = table.textContent.matchAll(
		/(\d+)(?:\s*\((\d+)\))?:\s*([a-zA-Z,*\s]+)/gi
	)
	const phoneCodes = Array.from(matches)
		.map((match) => {
			const [_, code, areaCode, description] = match
			const value = description.trim()

			// Ignore cells with "—" or "↙" (not matched by the regex) that are
			// essentially empty and represent unused codes.
			if (value.length === 0) return

			let countries: string[] | null
			if (value === 'North American Numbering Plan') {
				countries = ['US', 'CA']
			} else if (value === 'RU and KZ') {
				countries = ['RU', 'KZ']
			} else if (value === '**') {
				countries = null
			} else {
				// Not using `,` as the separator because there's one instance which has
				// a missing colon.
				countries = value.split(/[^a-z]+/i)
			}

			return {
				code: parseInt(code, 10),
				area_code: areaCode ? parseInt(areaCode, 10) : null,
				countries,
			}
		})
		.filter(Boolean)

	await writeData(import.meta.url, 'data', {
		source,
		timestamp: new Date().toISOString(),
		data: phoneCodes,
	})
}

main()
