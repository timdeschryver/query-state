import { CommonModule } from '@angular/common';
import { Directive, Input, NgModule, TemplateRef } from '@angular/core';
import { RequestState } from 'request-state-contracts';

@Directive({
  selector: '[rsRequestState]',
})
export class RequestStateTemplateDirective {
  @Input() rsRequestState!: RequestState;

  constructor(public templateRef: TemplateRef<unknown>) {}
}

@NgModule({
  imports: [CommonModule],
  declarations: [RequestStateTemplateDirective],
  exports: [RequestStateTemplateDirective],
})
export class RequestStateTemplateDirectiveModule {}
