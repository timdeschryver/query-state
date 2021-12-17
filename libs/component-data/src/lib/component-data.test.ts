import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ComponentData } from './component-data';
import { ComponentDataCache } from './data-cache';
import { ComponentDataConfig } from './data-config';
import { ComponentDataService } from './data-service';

function setup(config: Partial<ComponentDataConfig> = { name: 'test' }) {
  jest.useFakeTimers();
  const router = { navigate: jest.fn() } as unknown as Router;
  const route = {
    params: new Subject<Record<string, unknown>>(),
    queryParams: new Subject<Record<string, unknown>>(),
    snapshot: {},
  };
  const service = {
    query: jest.fn(() => of({ data: 'response' })),
  } as ComponentDataService<unknown>;
  const cache = new ComponentDataCache();

  const componentData = new ComponentData(
    route as unknown as ActivatedRoute,
    router,
    cache,
    service,
    config as ComponentDataConfig
  );

  const emits: unknown[] = [];
  componentData.data$.subscribe((value) => emits.push(value));

  route.params.next({ id: '1' });
  route.queryParams.next({ id: '1' });

  return {
    componentData,
    emits,
    router,
    route,
    service,
    cache,
    config,
  };
}

afterEach(() => {
  jest.useRealTimers();
});

it('executes the query on param navigation', () => {
  const { service, route, emits } = setup();
  route.params.next({ id: '2' });
  jest.advanceTimersByTime(1);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: '2' },
    queryParams: { id: '1' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('executes the query on query param navigation', () => {
  const { service, route, emits } = setup();
  route.queryParams.next({ id: '2' });
  jest.advanceTimersByTime(1);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: '1' },
    queryParams: { id: '2' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('ends up in the error state on failure', () => {
  const { service, emits } = setup();
  service.query = jest.fn(() => throwError(() => 'Something went wrong'));
  jest.advanceTimersByTime(1);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: '1' },
    queryParams: { id: '1' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'error', error: 'Something went wrong' },
  ]);
});

it('builds and uses the cache on route re-enter', () => {
  const { route, emits } = setup();
  jest.advanceTimersByTime(1);

  route.params.next({ id: '2' });
  jest.advanceTimersByTime(1);

  route.params.next({ id: '1' });
  jest.advanceTimersByTime(1);

  expect(emits).toEqual([
    { state: 'idle' },
    // param 1
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
    // param 2
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
    // param 1 again
    { state: 'revalidate', data: { data: 'response' } },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('does not refresh when params are the same', () => {
  const { route, emits } = setup();
  jest.advanceTimersByTime(1);

  route.params.next({ id: '1' });
  jest.advanceTimersByTime(1);

  route.queryParams.next({ id: '1' });
  jest.advanceTimersByTime(1);

  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('refresh revalidates the response', () => {
  const { componentData, emits } = setup();
  jest.advanceTimersByTime(1);

  componentData.refresh();
  jest.advanceTimersByTime(1);

  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
    { state: 'revalidate', data: { data: 'response' } },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('refresh as a stream revalidates the response', () => {
  const { componentData, emits } = setup();
  jest.advanceTimersByTime(1);

  const refresh = new Subject<void>();
  componentData.refresh(refresh);

  refresh.next();
  jest.advanceTimersByTime(1);

  refresh.next();
  jest.advanceTimersByTime(1);

  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
    { state: 'revalidate', data: { data: 'response' } },
    { state: 'success', data: { data: 'response' } },
    { state: 'revalidate', data: { data: 'response' } },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('update navigates with queryParams', () => {
  const { componentData, router } = setup();
  jest.advanceTimersByTime(1);

  componentData.update({ id: '2' });
  jest.advanceTimersByTime(1);

  expect(router.navigate).toHaveBeenCalledWith(
    [],
    expect.objectContaining({
      queryParams: { id: '2' },
    })
  );
});

it('update as stream navigates with queryParams', () => {
  const { componentData, router } = setup();
  jest.advanceTimersByTime(1);

  const subject = new Subject();
  componentData.update(subject);

  subject.next({ id: '2' });
  jest.advanceTimersByTime(1);

  expect(router.navigate).toHaveBeenCalledWith(
    [],
    expect.objectContaining({
      queryParams: { id: '2' },
    })
  );
});

it('disables initial query when set', () => {
  const { service, emits } = setup({ disableInitialLoad: true });
  jest.advanceTimersByTime(1);

  expect(service.query).not.toHaveBeenCalled();
  expect(emits).toEqual([{ state: 'idle' }]);
});

it('ignores emits when set', () => {
  const { route, service, emits } = setup({
    ignore: ({ params }) => params.id === '1',
  });
  jest.advanceTimersByTime(1);

  expect(service.query).not.toHaveBeenCalled();
  expect(emits).toEqual([{ state: 'idle' }]);

  route.params.next({ id: '2' });
  jest.advanceTimersByTime(1);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: '2' },
    queryParams: { id: '1' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
  ]);
});
