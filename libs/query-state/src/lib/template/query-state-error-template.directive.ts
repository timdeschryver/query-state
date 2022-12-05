import { Directive,  TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[qsError]',
  standalone: true
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
