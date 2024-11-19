type MapConstructor = {
  new <K, V>(entries?: readonly (readonly [K, V])[] | null): Map<K, V>;
  new <K, V>(iterable?: Iterable<readonly [K, V]> | null): Map<K, V>;
}

type SetConstructor = {
  new <T>(values?: readonly T[] | null): Set<T>;
  new <T>(iterable?: Iterable<T> | null): Set<T>;
}

export interface Multimap<K, V> {
  readonly size: number;
  clear(): void;
  delete(value: V): boolean;
  deleteAll(key: K): boolean;
  forEach(callbackfn: (value: V, key: K, multimap: Multimap<K, V>) => void, thisArg?: any): void;
  getAll(key: K): Iterable<V> | undefined;
  has(value: V): boolean;
  hasKey(key: K): boolean;
  add(key: K, value: V): this;
  set(key: K, value: readonly V[]): this;
  set(key: K, value: Iterable<V>): this;

  [Symbol.iterator](): IterableIterator<[K, V]>;
  entries(): IterableIterator<[K, V]>;
  keys(): IterableIterator<K>;
  values(): IterableIterator<V>;

  readonly [Symbol.toStringTag]: string;
}

interface MultimapConstructor {
  new(): Multimap<any, any>;
  new <K, V>(entries?: readonly (readonly [K, V[]])[] | null): Multimap<K, V>;
  new <K, V>(iterable?: Iterable<readonly [K, Iterable<V>]> | null): Multimap<K, V>;
  readonly prototype: Multimap<any, any>;
}

export const createMultimapConstructor = (SetConstructor: SetConstructor, MapConstructor: MapConstructor) => {
  type LocalMultimap<K, V> = Multimap<K, V>

  const MultimapConstructor: MultimapConstructor = class Multimap<K, V> implements LocalMultimap<K, V> {
    #map: Map<K, Set<V>>

    constructor(iterable?: Iterable<readonly [K, Iterable<V>]> | null) {
      this.#map = new MapConstructor()

      if (iterable != null) {
        for (const [key, value] of iterable) {
          this.set(key, value)
        }
      }
    }

    get size(): number {
      let sum = 0

      for (const values of this.#map.values()) {
        sum += values.size
      }

      return sum
    }

    declare readonly [Symbol.toStringTag]: string

    declare [Symbol.iterator]: () => IterableIterator<[K, V]>

    clear(): void {
      for (const key of this.#map.keys()) {
        this.#map.get(key)!.clear()
      }

      this.#map.clear()
    }

    delete(value: V): boolean {
      let result = false

      for (const values of this.#map.values()) {
        result = values.delete(value) || result
      }

      return result
    }

    deleteAll(key: K): boolean {
      if (this.#map.has(key)) {
        this.#map.get(key)!.clear()
        this.#map.delete(key)
        return true
      } else {
        return false
      }
    }

    forEach(callbackfn: (value: V, key: K, multimap: Multimap<K, V>) => void, thisArg?: any): void {
      for (const [key, values] of this.#map.entries()) {
        for (const value of values) {
          callbackfn.call(thisArg, value, key, this)
        }
      }
    }

    getAll(key: K): Iterable<V> | undefined {
      if (this.#map.has(key)) {
        return this.#map.get(key)!.values()
      } else {
        return undefined
      }
    }

    has(value: V): boolean {
      for (const values of this.#map.values()) {
        if (values.has(value)) {
          return true
        }
      }

      return false
    }

    hasKey(key: K): boolean {
      return this.#map.has(key)
    }

    add(key: K, value: V): this {
      if (!this.#map.has(key)) {
        this.#map.set(key, new SetConstructor())
      }

      this.#map.get(key)!.add(value)

      return this
    }

    set(key: K, value: Iterable<V>): this {
      if (this.#map.has(key)) {
        this.#map.get(key)!.clear()
      }

      this.#map.set(key, new SetConstructor(value))

      return this
    }

    *entries(): IterableIterator<[K, V]> {
      for (const [key, values] of this.#map.entries()) {
        for (const value of values) {
          yield [key, value]
        }
      }
    }

    keys(): IterableIterator<K> {
      return this.#map.keys();
    }

    *values(): IterableIterator<V> {
      for (const values of this.#map.values()) {
        yield* values.values()
      }
    }
  }

  MultimapConstructor.prototype[Symbol.iterator] = MultimapConstructor.prototype.entries

  Object.defineProperty(MultimapConstructor.prototype, Symbol.toStringTag, {
    value: 'Multimap',
    writable: false,
    enumerable: false,
    configurable: true
  })

  return MultimapConstructor
}

export default createMultimapConstructor(Set, Map)
