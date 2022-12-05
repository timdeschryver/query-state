import {
  ComponentRef,
  Directive,
  Inject,
  InjectionToken,
  Input,
  OnInit,
  Optional,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { QueryStateData } from '../contracts';

@Directive({
  selector: '[qsDefaultError]',
  standalone: true
})
export class DefaultErrorTemplateDirective implements OnInit {
  ref?: ComponentRef<ErrorTemplateComponent>;
  private _qsDefaultError!: QueryStateData<unknown>;
  @Input() set qsDefaultError(value: QueryStateData<unknown>) {
    this._qsDefaultError = value;
    if (this.ref) {
      this.ref.instance.error = this.qsDefaultError.error;
      this.ref.instance.retries = this.qsDefaultError.meta.retries;
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
      this.ref.instance.retries = this.qsDefaultError.meta.retries;
    }
  }
}

export interface ErrorTemplateComponent {
  error: unknown;
  retries?: number;
}

export const QUERY_STATE_ERROR_COMPONENT = new InjectionToken<
  Type<ErrorTemplateComponent>
>('Query State Error Component');
