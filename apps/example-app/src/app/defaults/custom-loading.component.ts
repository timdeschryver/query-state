import {Component} from '@angular/core';
import {LoadingTemplateComponent} from 'query-state';

@Component({
  selector: 'query-state-custom-loading',
  standalone: true,
  template: `
    <div>
      ⏱️⏱️⏱️
      {{
      retries
        ? 'this is taking a little longer than expected... ( ' +
        retries +
        ' )'
        : ''
      }}
    </div>
  `,
})
export class CustomLoadingComponent implements LoadingTemplateComponent {
  retries?: number;
  error?: unknown;
}
