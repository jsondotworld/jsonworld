import { data } from './data.ts'

export type IsoCountry = (typeof data)[number]
export type IsoCountryAlpha2 = IsoCountry['alpha2']
export type IsoCountryAlpha3 = IsoCountry['alpha3']
export type IsoCountryNumeric = IsoCountry['numeric']
