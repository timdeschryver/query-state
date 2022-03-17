import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { UrlState, MockUrlState, QueryParams } from 'query-state';
import { GitHubService } from './github.service';
import { SearchComponent, SearchComponentModule } from './search.component';

it('search and render user', async () => {
  await render(SearchComponent, {
    excludeComponentDeclaration: true,
    imports: [SearchComponentModule, RouterTestingModule.withRoutes([])],
    providers: [
      {
        provide: GitHubService,
        useValue: {
          query: ({ queryParams }: QueryParams) =>
            of({ login: queryParams.username }),
        },
      },
    ],
  });

  userEvent.type(screen.getByRole('textbox'), 'Sarah');
  expect(await screen.findByText(/"login": "Sarah"/i)).toBeVisible();

  userEvent.clear(screen.getByRole('textbox'));
  // expect(await screen.findByText(/"state": "idle"/i)).toBeVisible();

  userEvent.type(screen.getByRole('textbox'), 'Bob');
  expect(await screen.findByText(/"login": "Bob"/i)).toBeVisible();
});

it('search and render user with MockUrlState', async () => {
  await render(SearchComponent, {
    excludeComponentDeclaration: true,
    imports: [SearchComponentModule, RouterTestingModule.withRoutes([])],
    componentProviders: [
      {
        provide: UrlState,
        useClass: MockUrlState,
      },
    ],
    providers: [
      {
        provide: GitHubService,
        useValue: {
          query: ({ queryParams }: QueryParams) =>
            of({ login: queryParams.username }),
        },
      },
    ],
  });

  userEvent.type(screen.getByRole('textbox'), 'Sarah');
  expect(await screen.findByText(/"login": "Sarah"/i)).toBeVisible();

  userEvent.clear(screen.getByRole('textbox'));
  // expect(await screen.findByText(/"state": "idle"/i)).toBeVisible();

  userEvent.type(screen.getByRole('textbox'), 'Bob');
  expect(await screen.findByText(/"login": "Bob"/i)).toBeVisible();
});
