export interface Deferred<V> {
  promise: Promise<V>;
  resolve: (value: V) => void;
  reject: (reason: any) => void;
  state: 'pending' | 'resolved' | 'rejected';
}

export function defer<V>(): Deferred<V> {
  let resolve: ((value: V) => void) | undefined = undefined;
  let reject: ((reason: any) => void) | undefined = undefined;
  const promise = new Promise<V>((res, rej) => {
    resolve = (value) => {
      res(value);
      deferred.state = 'resolved';
    };
    reject = (reason) => {
      rej(reason);
      deferred.state = 'rejected';
    };
  });
  const deferred: Deferred<V> = {
    promise,
    resolve: resolve!,
    reject: reject!,
    state: 'pending',
  };
  return deferred;
}
