import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  Input,
  NgModule,
  OnDestroy,
} from '@angular/core';
import { QueryStateData } from 'query-state-contracts';
import { isObservable, Observable, Subscription } from 'rxjs';
import { DefaultErrorDirectiveModule } from './default-error-template.directive';
import { DefaultLoadingDirectiveModule } from './default-loading-template.directive';
import {
  ErrorQueryStateTemplateDirective,
  ErrorQueryStateTemplateDirectiveModule,
} from './query-state-error-template.directive';
import {
  IdleQueryStateTemplateDirective,
  IdleQueryStateTemplateDirectiveModule,
} from './query-state-idle-template.directive';
import {
  LoadingQueryStateTemplateDirective,
  LoadingQueryStateTemplateDirectiveModule,
} from './query-state-loading-template.directive';

@Component({
  selector: 'query-state-template',
  template: `
    <ng-container *ngIf="qsState as qs">
      <ng-container [ngSwitch]="qs.state">
        <ng-container *ngSwitchCase="'loading'">
          <ng-container *ngIf="loadingTemplate; else defaultLoading">
            <ng-container
              *ngTemplateOutlet="
                loadingTemplate.templateRef;
                context: {
                  $implicit: qs.retries,
                  error: qs.error,
                  retries: qs.retries
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
                  retries: qs.retries
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
                  $implicit: qs.data,
                  data: qs.data,
                  revalidating: qs.state === 'revalidate',
                  error: qs.error,
                  retries: qs.retries
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
    value: QueryStateData<T> | Observable<QueryStateData<T>> | null | undefined
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

@NgModule({
  imports: [
    CommonModule,
    LoadingQueryStateTemplateDirectiveModule,
    ErrorQueryStateTemplateDirectiveModule,
    IdleQueryStateTemplateDirectiveModule,
    DefaultLoadingDirectiveModule,
    DefaultErrorDirectiveModule,
  ],
  declarations: [QueryStateTemplateComponent],
  exports: [
    QueryStateTemplateComponent,
    IdleQueryStateTemplateDirective,
    ErrorQueryStateTemplateDirective,
    LoadingQueryStateTemplateDirective,
  ],
})
export class QueryStateTemplateModule {}
