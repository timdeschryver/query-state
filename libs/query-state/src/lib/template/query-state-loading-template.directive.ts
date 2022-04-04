import { CommonModule } from '@angular/common';
import { Directive, NgModule, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[qsLoading]',
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

@NgModule({
  imports: [CommonModule],
  declarations: [LoadingQueryStateTemplateDirective],
  exports: [LoadingQueryStateTemplateDirective],
})
export class LoadingQueryStateTemplateDirectiveModule {}
