import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { ErrorTemplateComponent } from 'query-state';

@Component({
  selector: 'query-state-custom-error',
  template: `
    <div role="alert" style="border: 1px solid red">
      Something went wrong (retried {{ retries }} times)
      <pre>
        {{ error | json }}
      </pre
      >
    </div>
  `,
})
export class CustomErrorComponent implements ErrorTemplateComponent {
  error: unknown;
  retries?: number;
}

@NgModule({
  imports: [CommonModule],
  declarations: [CustomErrorComponent],
})
export class CustomErrorComponentModule {}
