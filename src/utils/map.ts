export function appendToMap<K, V>(items: Map<K, Array<V>>, key: K, item: V) {
  const list = items.get(key) ?? [];
  list.push(item);
  items.set(key, list);
}
