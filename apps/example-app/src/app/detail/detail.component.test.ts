import { FormsModule } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { render, screen } from '@testing-library/angular';
import { DetailComponent } from './detail.component';
import { PokemonService } from './pokemon.service';
import { ActivatedRoute } from '@angular/router';
import { QueryParams } from 'component-data';

it('search and render detail with ActivatedRoute', async () => {
  await render(DetailComponent, {
    imports: [FormsModule, RouterTestingModule.withRoutes([])],
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

  expect(await screen.findByText(/"state": "success"/i)).toBeVisible();
  expect(await screen.findByText(/"id": 100/i)).toBeVisible();
});

it('search and render detail without activated route', async () => {
  await render(DetailComponent, {
    imports: [FormsModule, RouterTestingModule.withRoutes([])],
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

  expect(await screen.findByText(/"state": "success"/i)).toBeVisible();
  expect(await screen.findByText(/"id": 3/i)).toBeVisible();
});
