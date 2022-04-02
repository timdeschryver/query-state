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
import { QueryStateData } from '../contracts';

@Directive({
  selector: '[qsDefaultLoading]',
})
export class DefaultLoadingTemplateDirective implements OnInit {
  ref?: ComponentRef<LoadingTemplateComponent>;
  private _qsDefaultLoading!: QueryStateData<unknown>;
  @Input() set qsDefaultLoading(value: QueryStateData<unknown>) {
    this._qsDefaultLoading = value;
    if (this.ref) {
      this.ref.instance.error = this.qsDefaultLoading.error;
      this.ref.instance.retries = this.qsDefaultLoading.retries;
      this.ref.changeDetectorRef.markForCheck();
    }
  }

  get qsDefaultLoading(): QueryStateData<unknown> {
    return this._qsDefaultLoading;
  }

  constructor(
    private viewContainerRef: ViewContainerRef,

    @Optional()
    @Inject(QUERY_STATE_LOADING_COMPONENT)
    private loadingComponent?: Type<LoadingTemplateComponent>
  ) {}

  ngOnInit(): void {
    if (this.loadingComponent) {
      this.viewContainerRef.clear();
      this.ref = this.viewContainerRef.createComponent(this.loadingComponent);
      this.ref.instance.error = this.qsDefaultLoading.error;
      this.ref.instance.retries = this.qsDefaultLoading.retries;
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

export const QUERY_STATE_LOADING_COMPONENT = new InjectionToken<
  Type<LoadingTemplateComponent>
>('Query State Loading Component');
