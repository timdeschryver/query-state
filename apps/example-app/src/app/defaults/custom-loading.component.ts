import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { LoadingComponent } from 'request-state';

@Component({
  selector: 'component-data-nx-custom-loading',
  template: ` <div>⏱️⏱️⏱️</div> `,
})
export class CustomLoadingComponent implements LoadingComponent {}

@NgModule({
  imports: [CommonModule],
  declarations: [CustomLoadingComponent],
})
export class CustomLoadingComponentModule {}
