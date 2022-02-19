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
export class DefaultLoadingDirective implements OnInit {
  constructor(
    private viewContainerRef: ViewContainerRef,

    @Optional()
    @Inject(REQUEST_STATE_LOADING_COMPONENT)
    private loadingComponent?: Type<LoadingComponent>
  ) {}

  ngOnInit() {
    if (this.loadingComponent) {
      this.viewContainerRef.clear();
      this.viewContainerRef.createComponent(this.loadingComponent);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LoadingComponent {}

@NgModule({
  declarations: [DefaultLoadingDirective],
  exports: [DefaultLoadingDirective],
})
export class DefaultLoadingDirectiveModule {}

export const REQUEST_STATE_LOADING_COMPONENT = new InjectionToken<
  Type<LoadingComponent>
>('Request State Loading Component');
