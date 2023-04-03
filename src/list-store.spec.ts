import { of } from 'rxjs';
import { LocalListStorage } from './list-store';

describe("list-store", function () {
  it("can create a list-stote", function () {
    const listStore = new LocalListStorage(({ ids: [] }) => of([] as { id: number }[]));
    expect(listStore).toBeTruthy();
  });
});

export { };