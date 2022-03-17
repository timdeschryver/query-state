import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { render, screen } from '@testing-library/angular';
import { UrlState, MockUrlState, QueryParams } from 'query-state';
import { DetailComponent, DetailComponentModule } from './detail.component';
import { PokemonService } from './pokemon.service';

it('search and render detail with ActivatedRoute', async () => {
  await render(DetailComponent, {
    excludeComponentDeclaration: true,
    imports: [DetailComponentModule, RouterTestingModule.withRoutes([])],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          params: new BehaviorSubject({ id: 100 }),
          queryParams: new BehaviorSubject({}),
          snapshot: { params: {}, queryParams: {} },
        },
      },
      {
        provide: PokemonService,
        useValue: {
          query: ({ params }: QueryParams) => {
            return of({ id: params.id });
          },
        },
      },
    ],
  });

  expect(await screen.findByText(/"id": 100/i)).toBeVisible();
});

it('search and render detail without activated route', async () => {
  await render(DetailComponent, {
    excludeComponentDeclaration: true,
    imports: [DetailComponentModule, RouterTestingModule.withRoutes([])],
    providers: [
      {
        provide: PokemonService,
        useValue: {
          // params is {} so we return a static value
          query: () => {
            return of({ id: 3 });
          },
        },
      },
    ],
  });

  expect(await screen.findByText(/"id": 3/i)).toBeVisible();
});

it('search and render detail with MockUrlState', async () => {
  await render(DetailComponent, {
    excludeComponentDeclaration: true,
    imports: [DetailComponentModule, RouterTestingModule.withRoutes([])],
    componentProviders: [
      {
        provide: UrlState,
        useValue: new MockUrlState({ params: { id: '1000' } }),
      },
    ],
    providers: [
      {
        provide: PokemonService,
        useValue: {
          query: ({ params }: QueryParams) => {
            return of({ id: params.id });
          },
        },
      },
    ],
  });

  expect(await screen.findByText(/"id": "1000"/i)).toBeVisible();
});
