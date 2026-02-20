import type { InstrumentType } from '@/types/instrument'
import type { Instrument } from './Instrument'
import { Piano } from './Piano'
import { Cello } from './Cello'

const instrumentMap: Record<InstrumentType, () => Instrument> = {
  piano: () => new Piano(),
  cello: () => new Cello(),
}

export class InstrumentFactory {
  static create(type: InstrumentType): Instrument {
    const factory = instrumentMap[type]
    if (!factory) {
      throw new Error(`Unknown instrument type: ${type}`)
    }
    return factory()
  }

  static getSupportedTypes(): InstrumentType[] {
    return Object.keys(instrumentMap) as InstrumentType[]
  }
}
