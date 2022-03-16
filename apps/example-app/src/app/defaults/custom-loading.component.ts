import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { LoadingComponent } from 'request-state';

@Component({
  selector: 'component-data-nx-custom-loading',
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
export class CustomLoadingComponent implements LoadingComponent {
  retries?: number;
  error?: unknown;
}

@NgModule({
  imports: [CommonModule],
  declarations: [CustomLoadingComponent],
})
export class CustomLoadingComponentModule {}
