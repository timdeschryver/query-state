import {
  ComponentRef,
  Directive,
  Inject,
  InjectionToken,
  Input,
  NgModule,
  OnInit,
  Optional,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { QueryStateData } from 'query-state-contracts';

@Directive({
  selector: '[qsDefaultError]',
})
export class DefaultErrorTemplateDirective implements OnInit {
  ref?: ComponentRef<ErrorTemplateComponent>;
  private _qsDefaultError!: QueryStateData<unknown>;
  @Input() set qsDefaultError(value: QueryStateData<unknown>) {
    this._qsDefaultError = value;
    if (this.ref) {
      this.ref.instance.error = this.qsDefaultError.error;
      this.ref.instance.retries = this.qsDefaultError.retries;
      this.ref.changeDetectorRef.markForCheck();
    }
  }

  get qsDefaultError(): QueryStateData<unknown> {
    return this._qsDefaultError;
  }

  constructor(
    private viewContainerRef: ViewContainerRef,

    @Optional()
    @Inject(QUERY_STATE_ERROR_COMPONENT)
    private errorComponent?: Type<ErrorTemplateComponent>
  ) {}

  ngOnInit(): void {
    if (this.errorComponent) {
      this.viewContainerRef.clear();
      this.ref = this.viewContainerRef.createComponent(this.errorComponent);
      this.ref.instance.error = this.qsDefaultError.error;
      this.ref.instance.retries = this.qsDefaultError.retries;
    }
  }
}

export interface ErrorTemplateComponent {
  error: unknown;
  retries?: number;
}

@NgModule({
  declarations: [DefaultErrorTemplateDirective],
  exports: [DefaultErrorTemplateDirective],
})
export class DefaultErrorDirectiveModule {}

export const QUERY_STATE_ERROR_COMPONENT = new InjectionToken<
  Type<ErrorTemplateComponent>
>('Query State Error Component');
