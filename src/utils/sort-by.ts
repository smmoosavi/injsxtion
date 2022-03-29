export function sortBy<V>(array: Array<V>, prop: (value: V) => number) {
  return [...array].sort((a, b) => prop(a) - prop(b));
}
