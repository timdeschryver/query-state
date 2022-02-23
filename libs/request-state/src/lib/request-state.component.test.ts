import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import {
  ErrorTemplateComponent,
  REQUEST_STATE_ERROR_COMPONENT,
} from './default-error-template.directive';
import {
  LoadingTemplateComponent,
  REQUEST_STATE_LOADING_COMPONENT,
} from './default-loading-template.directive';
import { RequestStateTemplateModule } from './request-state-template.component';

it('renders the custom loader template', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'loading' }">
          <ng-template rsLoadingRequestState>
            Loading State
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('Loading State')).toBeTruthy();
});

it('renders the custom loader component', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'loading' }">
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
      providers: [
        {
          provide: REQUEST_STATE_LOADING_COMPONENT,
          useValue: CustomLoadingComponent,
        },
      ],
    }
  );

  expect(screen.getByText('custom loading component')).toBeTruthy();
});

it('renders the custom error template', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'error', error: 'error message' }">
          <ng-template rsErrorRequestState let-error>
            Error State: {{error}}
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('Error State: error message')).toBeTruthy();
});

it('renders the custom error component', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'error', error: 'error message' }">
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
      providers: [
        {
          provide: REQUEST_STATE_ERROR_COMPONENT,
          useValue: CustomErrorComponent,
        },
      ],
    }
  );

  expect(
    screen.getByText('custom error component: error message')
  ).toBeTruthy();
});

it('renders the custom idle template', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'idle' }">
          <ng-template rsIdleRequestState let-data let-revalidating="revalidating">
            Idle State
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('Idle State')).toBeTruthy();
});

it('renders the custom success template', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'success', data: 'my data' }">
          <ng-template rsIdleRequestState let-data let-revalidating="revalidating">
            Idle State {{revalidating}}: {{data}}
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('Idle State false: my data')).toBeTruthy();
});

it('renders the custom revalidate template', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'revalidate', data: 'my data' }">
          <ng-template [rsIdleRequestState]="{ state: 'revalidate', data: 'my data' }" let-data let-revalidating="revalidating">
            Idle State {{revalidating}}: {{data}}
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('Idle State true: my data')).toBeTruthy();
});

@Component({
  selector: 'request-state-custom-loading',
  template: 'custom loading component',
})
class CustomLoadingComponent implements LoadingTemplateComponent {}

@Component({
  selector: 'request-state-error-loading',
  template: 'custom error component: {{ error }}',
})
class CustomErrorComponent implements ErrorTemplateComponent {
  error: unknown;
}
