import { Directive,  TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[qsLoading]',
  standalone: true
})
export class LoadingQueryStateTemplateDirective {
  static ngTemplateContextGuard(
    _dir: LoadingQueryStateTemplateDirective,
    ctx: unknown
  ): ctx is {
    $implicit?: number;
    error?: unknown;
    retries?: number;
  } {
    return true;
  }

  constructor(public templateRef: TemplateRef<unknown>) {}
}
