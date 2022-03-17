import { CommonModule } from '@angular/common';
import { Directive, NgModule, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[qsErrorQueryState]',
})
export class ErrorQueryStateTemplateDirective {
  static ngTemplateContextGuard(
    _dir: ErrorQueryStateTemplateDirective,
    ctx: unknown
  ): ctx is { $implicit: unknown; error: unknown; retries?: number } {
    return true;
  }

  constructor(public templateRef: TemplateRef<unknown>) {}
}

@NgModule({
  imports: [CommonModule],
  declarations: [ErrorQueryStateTemplateDirective],
  exports: [ErrorQueryStateTemplateDirective],
})
export class ErrorQueryStateTemplateDirectiveModule {}
