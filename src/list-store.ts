import "./styles.css";
import { Observable, BehaviorSubject, combineLatest } from "rxjs";
import { switchMap, tap, map } from "rxjs/operators";

export class LocalListStorage<
  T extends { id: number },
  P extends { ids: number[] }
> {
  private request: (params: P) => Observable<T[]>;
  private newRequest = new BehaviorSubject<boolean>(true);
  private localStore: BehaviorSubject<T>[] = [];

  constructor(request: (params: P) => Observable<T[]>) {
    this.request = request;
  }

  public get(params: P, options: Partial<Options> = {}): Observable<T[]> {
    if (options.force) {
      this.newRequest.next(true);
    }

    const newIds: number[] = [];
    const oldIds: number[] = [];

    params.ids.forEach(id => {
      const storeIds = this.localStore.map(itemContainer => itemContainer.value.id);
      if (storeIds.includes(id)) {
        oldIds.push(id);
      } else {
        newIds.push(id)
      }
    });

    const storedItems = combineLatest(
      this.localStore.filter(itemContainer => oldIds.includes(itemContainer.value.id)),
    );

    if (newIds.length) {
      //TODO: this should alwasy return stored items but wait for then the store is updated with the new values
      return combineLatest([
        this.fetchNewValue(params),
        storedItems,
      ]).pipe(
        map(([newItems, oldItems]) => [...oldItems, ...newItems]),
      )
    } else {
      return storedItems;
    }

  }

  private fetchNewValue(params: P): Observable<T[]> {
    return this.request(params).pipe(
      tap((result) => this.storeItem(result)),
    );
  }

  private storeItem(items: T[]): void {
    const itemContainers = items.map(item => new BehaviorSubject(item));
    this.localStore = this.localStore.concat(itemContainers);
    // this.localStore.next([
    //   ...this.localStore.value,
    //   ...itemContainers,
    // ])
  }

}

type Options = {
  force: boolean;
};
