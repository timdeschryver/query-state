import { CommonModule } from '@angular/common';
import { Directive, NgModule, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[rsErrorRequestState]',
})
export class ErrorRequestStateTemplateDirective {
  static ngTemplateContextGuard(
    _dir: ErrorRequestStateTemplateDirective,
    ctx: unknown
  ): ctx is { $implicit: unknown; error: unknown } {
    return true;
  }

  constructor(public templateRef: TemplateRef<unknown>) {}
}

@NgModule({
  imports: [CommonModule],
  declarations: [ErrorRequestStateTemplateDirective],
  exports: [ErrorRequestStateTemplateDirective],
})
export class ErrorRequestStateTemplateDirectiveModule {}
