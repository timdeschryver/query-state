import { CommonModule } from '@angular/common';
import { Directive, Input, NgModule, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { QueryStateData } from '../contracts';

@Directive({
  selector: 'ng-template[qsIdleQueryState]',
})
export class IdleQueryStateTemplateDirective<T> {
  @Input() qsIdleQueryState:
    | QueryStateData<T>
    | Observable<QueryStateData<T>>
    | undefined
    | '';

  static ngTemplateContextGuard<T>(
    _dir: IdleQueryStateTemplateDirective<T>,
    ctx: unknown
  ): ctx is {
    $implicit?: T;
    data?: T;
    revalidating: boolean;
    error?: unknown;
    retries?: number;
  } {
    return true;
  }

  constructor(public templateRef: TemplateRef<unknown>) {}
}

@NgModule({
  imports: [CommonModule],
  declarations: [IdleQueryStateTemplateDirective],
  exports: [IdleQueryStateTemplateDirective],
})
export class IdleQueryStateTemplateDirectiveModule {}
