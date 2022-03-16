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
import { RequestStateData } from 'request-state-contracts';

@Directive({
  selector: '[rsDefaultError]',
})
export class DefaultErrorTemplateDirective implements OnInit {
  ref?: ComponentRef<ErrorTemplateComponent>;
  private _rsDefaultError!: RequestStateData<unknown>;
  @Input() set rsDefaultError(value: RequestStateData<unknown>) {
    this._rsDefaultError = value;
    if (this.ref) {
      this.ref.instance.error = this.rsDefaultError.error;
      this.ref.instance.retries = this.rsDefaultError.retries;
      this.ref.changeDetectorRef.markForCheck();
    }
  }

  get rsDefaultError() {
    return this._rsDefaultError;
  }

  constructor(
    private viewContainerRef: ViewContainerRef,

    @Optional()
    @Inject(REQUEST_STATE_ERROR_COMPONENT)
    private errorComponent?: Type<ErrorTemplateComponent>
  ) {}

  ngOnInit() {
    if (this.errorComponent) {
      this.viewContainerRef.clear();
      this.ref = this.viewContainerRef.createComponent(this.errorComponent);
      this.ref.instance.error = this.rsDefaultError.error;
      this.ref.instance.retries = this.rsDefaultError.retries;
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

export const REQUEST_STATE_ERROR_COMPONENT = new InjectionToken<
  Type<ErrorTemplateComponent>
>('Request State Error Component');
