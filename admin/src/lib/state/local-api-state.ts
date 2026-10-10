import { createStore, type StoreApi } from 'zustand/vanilla';

export type LocalApiSnapshot<T> = {
  data: T | null;
  key: string | null;
  isFetching: boolean;
  isStale: boolean;
  error: string | null;
  updatedAt: number | null;
};

type CacheEntry<T> = { data: T; updatedAt: number };

/** A small stale-while-revalidate cache backed by Zustand for one API resource. */
export class LocalApiState<T, Params> {
  readonly store: StoreApi<LocalApiSnapshot<T>> = createStore<LocalApiSnapshot<T>>()(() => ({
    data: null,
    key: null,
    isFetching: false,
    isStale: false,
    error: null,
    updatedAt: null,
  }));

  private readonly cache = new Map<string, CacheEntry<T>>();
  private readonly inFlight = new Map<string, Promise<T>>();
  private activeKey: string | null = null;
  private generation = 0;

  constructor(
    private readonly fetchData: (params: Params) => Promise<T>,
    private readonly makeKey: (params: Params) => string,
  ) {}

  async load(params: Params): Promise<T> {
    const key = this.makeKey(params);
    const generation = this.generation;
    this.activeKey = key;

    const previous = this.store.getState();
    const cached = this.cache.get(key);
    const sameQueryData = previous.key === key ? previous.data : null;
    const data = cached?.data ?? sameQueryData;

    this.store.setState({
      key,
      data,
      isFetching: true,
      isStale: data !== null,
      error: null,
      updatedAt: cached?.updatedAt ?? (data !== null ? previous.updatedAt : null),
    });

    const pending = this.inFlight.get(key);
    if (pending) return pending;

    // Defer invocation into a promise so a synchronous client error follows the
    // same error path as a rejected HTTP request.
    const request = Promise.resolve().then(() => this.fetchData(params));
    this.inFlight.set(key, request);

    try {
      const result = await request;
      if (generation === this.generation) {
        const updatedAt = Date.now();
        this.cache.set(key, { data: result, updatedAt });
        if (this.activeKey === key) {
          this.store.setState({ data: result, isFetching: false, isStale: false, error: null, updatedAt });
        }
      }
      return result;
    } catch (cause) {
      if (generation === this.generation && this.activeKey === key) {
        this.store.setState({
          isFetching: false,
          isStale: this.store.getState().data !== null,
          error: cause instanceof Error ? cause.message : 'Không thể tải dữ liệu',
        });
      }
      throw cause;
    } finally {
      if (this.inFlight.get(key) === request) this.inFlight.delete(key);
    }
  }

  invalidate(): void {
    // Ignore responses started before the mutation and force the next load to
    // hit the API instead of reusing an outdated in-flight request.
    this.generation += 1;
    this.inFlight.clear();
    this.cache.clear();
    const { data } = this.store.getState();
    this.store.setState({ isStale: data !== null });
  }

  clear(): void {
    this.generation += 1;
    this.activeKey = null;
    this.cache.clear();
    this.inFlight.clear();
    this.store.setState({
      data: null,
      key: null,
      isFetching: false,
      isStale: false,
      error: null,
      updatedAt: null,
    });
  }
}
