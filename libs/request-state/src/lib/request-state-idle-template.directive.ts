import { CommonModule } from '@angular/common';
import { Directive, Input, NgModule, TemplateRef } from '@angular/core';
import { RequestStateData } from 'request-state-contracts';
import { Observable } from 'rxjs';

@Directive({
  selector: 'ng-template[rsIdleRequestState]',
})
export class IdleRequestStateTemplateDirective<T> {
  @Input() rsIdleRequestState: RequestStateData<T> | Observable<RequestStateData<T>> | undefined | '';

  static ngTemplateContextGuard<T>(
    _dir: IdleRequestStateTemplateDirective<T>,
    ctx: unknown
  ): ctx is { $implicit: T | undefined; data: T | undefined; revalidating: boolean; } {
    return true;
  }

  constructor(public templateRef: TemplateRef<unknown>) {}
}

@NgModule({
  imports: [CommonModule],
  declarations: [IdleRequestStateTemplateDirective],
  exports: [IdleRequestStateTemplateDirective],
})
export class IdleRequestStateTemplateDirectiveModule {}
