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
  selector: '[rsDefaultLoading]',
})
export class DefaultLoadingTemplateDirective implements OnInit {
  ref?: ComponentRef<LoadingTemplateComponent>;
  private _rsDefaultLoading!: RequestStateData<unknown>;
  @Input() set rsDefaultLoading(value: RequestStateData<unknown>) {
    this._rsDefaultLoading = value;
    if (this.ref) {
      this.ref.instance.error = this.rsDefaultLoading.error;
      this.ref.instance.retries = this.rsDefaultLoading.retries;
      this.ref.changeDetectorRef.markForCheck();
    }
  }

  get rsDefaultLoading() {
    return this._rsDefaultLoading;
  }

  constructor(
    private viewContainerRef: ViewContainerRef,

    @Optional()
    @Inject(REQUEST_STATE_LOADING_COMPONENT)
    private loadingComponent?: Type<LoadingTemplateComponent>
  ) {}

  ngOnInit() {
    if (this.loadingComponent) {
      this.viewContainerRef.clear();
      this.ref = this.viewContainerRef.createComponent(this.loadingComponent);
      this.ref.instance.error = this.rsDefaultLoading.error;
      this.ref.instance.retries = this.rsDefaultLoading.retries;
    }
  }
}

export interface LoadingTemplateComponent {
  retries?: number;
  error?: unknown;
}

@NgModule({
  declarations: [DefaultLoadingTemplateDirective],
  exports: [DefaultLoadingTemplateDirective],
})
export class DefaultLoadingDirectiveModule {}

export const REQUEST_STATE_LOADING_COMPONENT = new InjectionToken<
  Type<LoadingTemplateComponent>
>('Request State Loading Component');
