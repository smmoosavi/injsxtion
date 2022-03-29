import { bubbleSort } from './bubble-sort';
import { sortDag } from './sort-dag';

export type Edge = [module: string, provider: string];

function getProviders(edges: Edge[]) {
  const providers = new Set<string>();
  for (const [, provider] of edges) {
    providers.add(provider);
  }
  return providers;
}

function compare(edges: Edge[], priority: Record<string, number>) {
  const edgesDict: Record<string, Set<String>> = {};
  for (const [mod, provider] of edges) {
    if (!edgesDict[mod]) edgesDict[mod] = new Set();
    edgesDict[mod].add(provider);
  }
  return (a: string, b: string) => {
    if (edgesDict[b]?.has(a)) {
      return -1;
    }
    if (edgesDict[a]?.has(b)) {
      return 1;
    }
    const priorityA = priority[a] ?? 0;
    const priorityB = priority[b] ?? 0;
    return priorityA - priorityB;
  };
}

export function sortProviders(
  edges: Edge[],
  priority: Record<string, number>,
): string[] {
  const providers = getProviders(edges);
  const onlyProviders = sortDag(edges).filter((n) => providers.has(n));
  return bubbleSort(onlyProviders, compare(edges, priority));
}
