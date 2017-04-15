import { RecursiveArray, flattenDeep } from 'lodash'

type Falsy = undefined | null | 0 | '' | false

export function cx(...classes: Array<string | Falsy | RecursiveArray<string | Falsy>>): string {
  return flattenDeep(classes).filter(Boolean).join(' ')
}
