import { JSDOM } from 'jsdom'
import { assert, isNotUndefined } from 'typed-assert'
import { writeData } from '../utils/writeData.js'

async function main() {
	const source = 'https://en.wikipedia.org/wiki/ISO_3166-1'

	const response = await fetch(source)
	assert(response.ok, `Could not fetch HTML: ${response.status}`)
	const html = await response.text()

	const dom = new JSDOM(html)
	const document = dom.window.document

	const countriesMatch = document.body.textContent.match(
		/codes for (\d+) countries/i
	)?.[1]
	isNotUndefined(countriesMatch)

	const countriesCount = parseInt(countriesMatch, 10)
	assert(countriesCount > 200 && countriesCount < 300)

	const tables = document.querySelectorAll('table.wikitable')
	const table = Array.from(tables).find((table) =>
		table.querySelector('caption')?.innerHTML.includes('ISO 3166-1 table')
	)
	isNotUndefined(table)

	const rows = Array.from(table.querySelectorAll('tr'))
	assert(!!rows.shift()?.querySelector('th'), 'Expected header row')

	const isoList = rows.map((row) => {
		const [
			tdName,
			tdAlpha2,
			tdAlpha3,
			tdNumber,
			_tdSubdivisions,
			tdIndependence,
		] = Array.from(row.querySelectorAll('td'))

		const name = tdName.querySelector('a[title]')?.textContent
		isNotUndefined(name)

		const alpha2 = tdAlpha2.querySelector('span.monospaced')?.textContent
		isNotUndefined(alpha2)
		assert(alpha2.length === 2)

		const alpha3 = tdAlpha3.querySelector('span.monospaced')?.textContent
		isNotUndefined(alpha3)
		assert(alpha3.length === 3)

		const numeric = tdNumber.querySelector('span.monospaced')?.textContent
		isNotUndefined(numeric)
		assert(numeric.length === 3)

		const independence = tdIndependence.textContent.trim()
		const independent =
			independence === 'Yes' ? true : independence === 'No' ? false : undefined
		isNotUndefined(independent)

		return { name, alpha2, alpha3, numeric, independent }
	})

	assert(isoList.length === countriesCount)

	await writeData(import.meta.url, 'data', {
		source,
		timestamp: new Date().toISOString(),
		data: isoList,
	})
}

main()
