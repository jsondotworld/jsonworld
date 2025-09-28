import { data } from './data.js'
import {
	IsoCountryAlpha2,
	IsoCountryAlpha3,
	IsoCountryNumeric,
} from './types.js'

export const getIsoCountry = (
	key: 'alpha2' | 'alpha3' | 'numeric',
	value: string
) => data.find((entry) => entry[key] === value)

export const isIsoCountryAlpha2 = (input: string): input is IsoCountryAlpha2 =>
	!!getIsoCountry('alpha2', input)

export const isIsoCountryAlpha3 = (input: string): input is IsoCountryAlpha3 =>
	!!getIsoCountry('alpha3', input)

export const isIsoCountryNumeric = (
	input: string
): input is IsoCountryNumeric => !!getIsoCountry('numeric', input)
