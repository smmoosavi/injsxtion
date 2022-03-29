export function bubbleSort<V>(values: V[], compare: (a: V, b: V) => number) {
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = 0; i < values.length - 1; i++) {
      if (compare(values[i], values[i + 1]) > 0) {
        const tmp = values[i];
        values[i] = values[i + 1];
        values[i + 1] = tmp;
        swapped = true;
      }
    }
  }
  return values;
}
