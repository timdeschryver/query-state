import {
  Directive,
  Inject,
  InjectionToken,
  NgModule,
  OnInit,
  Optional,
  Type,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[rsDefaultLoading]',
})
export class DefaultLoadingTemplateDirective implements OnInit {
  constructor(
    private viewContainerRef: ViewContainerRef,

    @Optional()
    @Inject(REQUEST_STATE_LOADING_COMPONENT)
    private loadingComponent?: Type<LoadingTemplateComponent>
  ) {}

  ngOnInit() {
    if (this.loadingComponent) {
      this.viewContainerRef.clear();
      this.viewContainerRef.createComponent(this.loadingComponent);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LoadingTemplateComponent {}

@NgModule({
  declarations: [DefaultLoadingTemplateDirective],
  exports: [DefaultLoadingTemplateDirective],
})
export class DefaultLoadingDirectiveModule {}

export const REQUEST_STATE_LOADING_COMPONENT = new InjectionToken<
  Type<LoadingTemplateComponent>
>('Request State Loading Component');
