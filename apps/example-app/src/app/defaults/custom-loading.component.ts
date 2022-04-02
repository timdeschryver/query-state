import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { LoadingTemplateComponent } from 'query-state';

@Component({
  selector: 'query-state-custom-loading',
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

@NgModule({
  imports: [CommonModule],
  declarations: [CustomLoadingComponent],
})
export class CustomLoadingComponentModule {}
