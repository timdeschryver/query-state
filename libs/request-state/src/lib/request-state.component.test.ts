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
        <request-state-template [requestState]="{ state: 'loading', retries: 2, error: 'oops' }">
          <ng-template rsLoadingRequestState let-retries='retries' let-error='error'>
            ({{retries}} - {{error}}) Loading State
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('(2 - oops) Loading State')).toBeTruthy();
});

it('renders the custom loader template: implicit retries', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'loading', retries: 2, error: 'oops' }">
          <ng-template rsLoadingRequestState let-retries>
            ({{retries}}) Loading State
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('(2) Loading State')).toBeTruthy();
});

it('renders the provided loader component', async () => {
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

it('renders the provided loader component with retry', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'loading', error: 'oops', retries: 2 }">
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
      providers: [
        {
          provide: REQUEST_STATE_LOADING_COMPONENT,
          useValue: CustomLoadingWithRetryComponent,
        },
      ],
    }
  );

  expect(screen.getByText('oops 2')).toBeTruthy();
});

it('renders the custom error template', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'error', error: 'error message', retries: 8 }">
          <ng-template rsErrorRequestState let-error='error' let-retries='retries'>
            Error State: {{error}} ({{retries}})
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('Error State: error message (8)')).toBeTruthy();
});

it('renders the custom error template: implicit error', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'error', error: 'error is implicit' }">
          <ng-template rsErrorRequestState let-error>
            {{error}}
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('error is implicit')).toBeTruthy();
});

it('renders the provided error component', async () => {
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

it('renders the provided error component with retry', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'error', error: 'error message', retries: 3 }">
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
      providers: [
        {
          provide: REQUEST_STATE_ERROR_COMPONENT,
          useValue: CustomErrorWithRetryComponent,
        },
      ],
    }
  );

  expect(
    screen.getByText('custom error component: error message 3')
  ).toBeTruthy();
});

it('renders the custom idle template', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'idle', data: 'hello' }">
          <ng-template rsIdleRequestState let-data='data' let-revalidating='revalidating'>
            {{data}} Idle State ({{revalidating}})
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('hello Idle State (false)')).toBeTruthy();
});

it('renders the custom idle template: implicit data', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'idle', data: 'data is implicit' }">
          <ng-template rsIdleRequestState let-data>
            {{ data }}
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('data is implicit')).toBeTruthy();
});

it('renders the custom success template', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'success', data: 'my data' }">
          <ng-template rsIdleRequestState let-data='data' let-revalidating='revalidating'>
            Success State {{revalidating}}: {{data}}
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('Success State false: my data')).toBeTruthy();
});

it('renders the custom success template: implicit data', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'success', data: 'data is implicit' }">
          <ng-template rsIdleRequestState let-data='data'>
            {{data}}
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('data is implicit')).toBeTruthy();
});

it('renders the custom revalidate template', async () => {
  await render(
    `
        <request-state-template [requestState]="{ state: 'revalidate', data: 'my data', retries: 1 }">
          <ng-template [rsIdleRequestState]="{ state: 'revalidate', data: 'my data' }" let-data let-revalidating='revalidating' let-retries='retries'>
            ({{retries}}) Idle State {{revalidating}}: {{data}}
          </ng-template>
        </request-state-template>
      `,
    {
      imports: [RequestStateTemplateModule],
    }
  );

  expect(screen.getByText('(1) Idle State true: my data')).toBeTruthy();
});

@Component({
  selector: 'request-state-custom-loading',
  template: 'custom loading component',
})
class CustomLoadingComponent implements LoadingTemplateComponent {}

@Component({
  selector: 'request-state-custom-loading-with-retry',
  template: '{{error}} {{retries}}',
})
class CustomLoadingWithRetryComponent implements LoadingTemplateComponent {}

@Component({
  selector: 'request-state-error-loading',
  template: 'custom error component: {{ error }}',
})
class CustomErrorComponent implements ErrorTemplateComponent {
  error: unknown;
}

@Component({
  selector: 'request-state-error-loading-with-retry',
  template: 'custom error component: {{ error }} {{ retries }}',
})
class CustomErrorWithRetryComponent implements ErrorTemplateComponent {
  error: unknown;
}
