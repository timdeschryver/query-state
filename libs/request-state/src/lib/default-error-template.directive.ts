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
export class DefaultErrorTemplateDirective implements OnInit {
  @Input() rsDefaultError: unknown;

  constructor(
    private viewContainerRef: ViewContainerRef,

    @Optional()
    @Inject(REQUEST_STATE_ERROR_COMPONENT)
    private errorComponent?: Type<ErrorTemplateComponent>
  ) {}

  ngOnInit() {
    if (this.errorComponent) {
      this.viewContainerRef.clear();
      const cmp = this.viewContainerRef.createComponent(this.errorComponent);
      cmp.instance.error = this.rsDefaultError;
    }
  }
}

export interface ErrorTemplateComponent {
  error: unknown;
}

@NgModule({
  declarations: [DefaultErrorTemplateDirective],
  exports: [DefaultErrorTemplateDirective],
})
export class DefaultErrorDirectiveModule {}

export const REQUEST_STATE_ERROR_COMPONENT = new InjectionToken<
  Type<ErrorTemplateComponent>
>('Request State Error Component');
