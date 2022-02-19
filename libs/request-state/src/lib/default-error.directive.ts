import {
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

@Directive({
  selector: '[rsDefaultError]',
})
export class DefaultErrorDirective implements OnInit {
  @Input() rsDefaultError: unknown;

  constructor(
    private viewContainerRef: ViewContainerRef,

    @Optional()
    @Inject(REQUEST_STATE_ERROR_COMPONENT)
    private errorComponent?: Type<ErrorComponent>
  ) {}

  ngOnInit() {
    if (this.errorComponent) {
      this.viewContainerRef.clear();
      const cmp = this.viewContainerRef.createComponent(this.errorComponent);
      cmp.instance.error = this.rsDefaultError;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ErrorComponent {
  error: unknown;
}

@NgModule({
  declarations: [DefaultErrorDirective],
  exports: [DefaultErrorDirective],
})
export class DefaultErrorDirectiveModule {}

export const REQUEST_STATE_ERROR_COMPONENT = new InjectionToken<
  Type<ErrorComponent>
>('Request State Error Component');
