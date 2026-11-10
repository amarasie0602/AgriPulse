import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scopeResourceEntries } from '../src/utils/reportScope'
import { estimateCarbon } from '../src/utils/carbon'
import type { ResourceEntry } from '../src/types/resource'
const entry=(id:string,farmId?:string,cropId?:string,date='2026-10-03T00:00:00Z',unit='L'):ResourceEntry=>({id,farmId,cropId,date,unit,resourceType:'FUEL',quantity:10,createdAt:'2026-10-20'})
const records=[entry('legacy'),entry('a','farm-a','rice'),entry('b','farm-b','tea'),entry('older','farm-a','rice','2026-09-30T00:00:00Z'),entry('alternate-unit','farm-a',undefined,undefined,'gallon')]
test('farm scopes retain unassigned history only when selected explicitly or in all records',()=>{
  assert.equal(scopeResourceEntries(records).length,5)
  assert.deepEqual(scopeResourceEntries(records,'unassigned').map(e=>e.id),['legacy'])
  assert.deepEqual(scopeResourceEntries(records,'farm-b').map(e=>e.id),['b'])
})
test('date bounds are inclusive on usage date and combine with farm and crop',()=>{
  assert.deepEqual(scopeResourceEntries(records,'farm-a','2026-10-03','2026-10-03','rice').map(e=>e.id),['a'])
  assert.equal(scopeResourceEntries(records,'farm-a','2027-01-01').length,0)
  assert.equal(scopeResourceEntries(records,'farm-b','','','rice').length,0)
})
test('filtered carbon estimates exclude foreign farms and unsupported units without converting them',()=>{
  const estimate=estimateCarbon(scopeResourceEntries(records,'farm-a','2026-10-01'))
  assert.equal(estimate.totalCo2eKg,26.8)
  assert.equal(estimate.totalUnmatchedEntries,1)
  assert.equal(estimateCarbon([]).hasData,false)
})
