import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { GitHubService } from './github.service';
import { SearchComponent } from './search.component';
import {
  ComponentRoute,
  MockComponentRoute,
  QueryParams,
} from 'component-data';
import { RouterTestingModule } from '@angular/router/testing';

it('search and render user', async () => {
  await render(SearchComponent, {
    imports: [FormsModule, RouterTestingModule.withRoutes([])],
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
  expect(await screen.findByText(/"state": "success"/i)).toBeVisible();
  expect(await screen.findByText(/"login": "Sarah"/i)).toBeVisible();

  userEvent.clear(screen.getByRole('textbox'));
  expect(await screen.findByText(/"state": "idle"/i)).toBeVisible();

  userEvent.type(screen.getByRole('textbox'), 'Bob');
  expect(await screen.findByText(/"state": "success"/i)).toBeVisible();
  expect(await screen.findByText(/"login": "Bob"/i)).toBeVisible();
});

it('search and render user with MockComponentRoute', async () => {
  await render(SearchComponent, {
    imports: [FormsModule],
    componentProviders: [
      {
        provide: ComponentRoute,
        useValue: new MockComponentRoute(),
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
  expect(await screen.findByText(/"state": "success"/i)).toBeVisible();
  expect(await screen.findByText(/"login": "Sarah"/i)).toBeVisible();

  userEvent.clear(screen.getByRole('textbox'));
  expect(await screen.findByText(/"state": "idle"/i)).toBeVisible();

  userEvent.type(screen.getByRole('textbox'), 'Bob');
  expect(await screen.findByText(/"state": "success"/i)).toBeVisible();
  expect(await screen.findByText(/"login": "Bob"/i)).toBeVisible();
});
