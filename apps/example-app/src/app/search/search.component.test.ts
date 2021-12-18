import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { GitHubService } from './github.service';
import { SearchComponent } from './search.component';
import { QueryParams } from 'component-data';

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
