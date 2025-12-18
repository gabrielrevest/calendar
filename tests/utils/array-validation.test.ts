import { describe, it, expect } from 'vitest'

describe('Array Validation', () => {
  it('devrait vérifier que les données sont des tableaux', () => {
    const data1: any = []
    const data2: any = null
    const data3: any = undefined
    const data4: any = {}
    const data5: any = [1, 2, 3]

    expect(Array.isArray(data1)).toBe(true)
    expect(Array.isArray(data2)).toBe(false)
    expect(Array.isArray(data3)).toBe(false)
    expect(Array.isArray(data4)).toBe(false)
    expect(Array.isArray(data5)).toBe(true)
  })

  it('devrait retourner un tableau vide si les données ne sont pas un tableau', () => {
    const safeArray = (data: any) => Array.isArray(data) ? data : []
    
    expect(safeArray([])).toEqual([])
    expect(safeArray(null)).toEqual([])
    expect(safeArray(undefined)).toEqual([])
    expect(safeArray({})).toEqual([])
    expect(safeArray([1, 2, 3])).toEqual([1, 2, 3])
  })
})

