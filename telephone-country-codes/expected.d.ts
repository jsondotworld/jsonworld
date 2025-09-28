import { IsoCountryAlpha2 } from '../iso-3166-1/types.js'

export type Expected = {
	code: number
	area_code: number | null
	countries: IsoCountryAlpha2[] | null
}[]
