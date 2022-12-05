import {CommonModule} from '@angular/common';
import {
  Component,
  ContentChild,
  Input,
  OnDestroy,
} from '@angular/core';
import {isObservable, Observable, Subscription} from 'rxjs';
import {QueryStateData} from '../contracts';
import {DefaultErrorTemplateDirective} from './default-error-template.directive';
import {DefaultLoadingTemplateDirective} from './default-loading-template.directive';
import {
  ErrorQueryStateTemplateDirective,
} from './query-state-error-template.directive';
import {
  IdleQueryStateTemplateDirective,
} from './query-state-idle-template.directive';
import {
  LoadingQueryStateTemplateDirective,
} from './query-state-loading-template.directive';

@Component({
  selector: 'query-state-template',
  standalone: true,
  imports: [DefaultErrorTemplateDirective, DefaultLoadingTemplateDirective, ErrorQueryStateTemplateDirective, IdleQueryStateTemplateDirective, LoadingQueryStateTemplateDirective, CommonModule],
  template: `
    <ng-container *ngIf="qsState as qs">
      <ng-container [ngSwitch]="qs.state">
        <ng-container *ngSwitchCase="'loading'">
          <ng-container *ngIf="loadingTemplate; else defaultLoading">
            <ng-container
              *ngTemplateOutlet="
                loadingTemplate.templateRef;
                context: {
                  $implicit: qs.meta.retries,
                  error: qs.error,
                  retries: qs.meta.retries
                }
              "
            ></ng-container>
          </ng-container>

          <ng-template #defaultLoading>
            <ng-template [qsDefaultLoading]="qs"></ng-template>
          </ng-template>
        </ng-container>

        <ng-container *ngSwitchCase="'error'">
          <ng-container *ngIf="errorTemplate; else defaultError">
            <ng-container
              *ngTemplateOutlet="
                errorTemplate.templateRef;
                context: {
                  $implicit: qs.error,
                  error: qs.error,
                  retries: qs.meta.retries
                }
              "
            ></ng-container>
          </ng-container>

          <ng-template #defaultError>
            <ng-template [qsDefaultError]="qs"></ng-template>
          </ng-template>
        </ng-container>

        <ng-container *ngSwitchDefault>
          <ng-container *ngIf="idleTemplate">
            <ng-container
              *ngTemplateOutlet="
                idleTemplate.templateRef;
                context: {
                  $implicit: qs.result,
                  result: qs.result,
                  revalidating: qs.state === 'revalidate',
                  error: qs.error,
                  retries: qs.meta.retries
                }
              "
            >
            </ng-container>
          </ng-container>
        </ng-container>
      </ng-container>
    </ng-container>
  `,
})
export class QueryStateTemplateComponent<T> implements OnDestroy {
  qsState?: QueryStateData<T> | null;
  subscription?: Subscription;

  @Input() set queryState(
    value: QueryStateData<T> | Observable<QueryStateData<T>>  | null | undefined
  ) {
    if (isObservable(value)) {
      this.subscription?.unsubscribe();
      this.subscription = value.subscribe((val) => {
        this.qsState = val;
      });
    } else {
      this.qsState = value;
    }
  }

  @ContentChild(LoadingQueryStateTemplateDirective)
  loadingTemplate?: LoadingQueryStateTemplateDirective;

  @ContentChild(ErrorQueryStateTemplateDirective)
  errorTemplate?: ErrorQueryStateTemplateDirective;

  @ContentChild(IdleQueryStateTemplateDirective)
  idleTemplate?: IdleQueryStateTemplateDirective<T>;

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
