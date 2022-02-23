import { CommonModule } from '@angular/common';
import { Component, ContentChild, Input, NgModule, OnDestroy } from '@angular/core';
import { RequestStateData } from 'request-state-contracts';
import { isObservable, Observable, Subscription } from 'rxjs';
import { DefaultErrorDirectiveModule } from './default-error-template.directive';
import { DefaultLoadingDirectiveModule } from './default-loading-template.directive';
import {
  ErrorRequestStateTemplateDirective,
  ErrorRequestStateTemplateDirectiveModule,
} from './request-state-error-template.directive';
import {
  IdleRequestStateTemplateDirective,
  IdleRequestStateTemplateDirectiveModule,
} from './request-state-idle-template.directive';
import {
  LoadingRequestStateTemplateDirective,
  LoadingRequestStateTemplateDirectiveModule,
} from './request-state-loading-template.directive';

@Component({
  selector: 'request-state-template',
  template: `
    <ng-container *ngIf="rsState as rs">
      <ng-container [ngSwitch]="rs.state">
        <ng-container *ngSwitchCase="'loading'">
          <ng-container *ngIf="loadingTemplate; else defaultLoading">
            <ng-container
              *ngTemplateOutlet="loadingTemplate.templateRef"
            ></ng-container>
          </ng-container>

          <ng-template #defaultLoading>
            <ng-template rsDefaultLoading></ng-template>
          </ng-template>
        </ng-container>

        <ng-container *ngSwitchCase="'error'">
          <ng-container *ngIf="errorTemplate; else defaultError">
            <ng-container
              *ngTemplateOutlet="
                errorTemplate.templateRef;
                context: {
                  $implicit: rs.error,
                  error: rs.error
                }
              "
            ></ng-container>
          </ng-container>

          <ng-template #defaultError>
            <ng-template [rsDefaultError]="rs.error"></ng-template>
          </ng-template>
        </ng-container>

        <ng-container *ngSwitchDefault>
          <ng-container *ngIf="idleTemplate">
            <ng-container
              *ngTemplateOutlet="
                idleTemplate.templateRef;
                context: {
                  $implicit: rs.data,
                  state: rs.data,
                  revalidating: rs.state === 'revalidate'
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
export class RequestStateTemplateComponent<T> implements OnDestroy {
  rsState?: RequestStateData<T> | null;
  subscription?: Subscription;

  @Input() set requestState(
    value:
      | RequestStateData<T>
      | Observable<RequestStateData<T>>
      | null
      | undefined
  ) {
    if (isObservable(value)) {
      this.subscription?.unsubscribe();
      this.subscription = value.subscribe((val) => {
        this.rsState = val;
      });
    } else {
      this.rsState = value;
    }
  }

  @ContentChild(LoadingRequestStateTemplateDirective)
  loadingTemplate?: LoadingRequestStateTemplateDirective;

  @ContentChild(ErrorRequestStateTemplateDirective)
  errorTemplate?: ErrorRequestStateTemplateDirective;

  @ContentChild(IdleRequestStateTemplateDirective)
  idleTemplate?: IdleRequestStateTemplateDirective<T>;

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

@NgModule({
  imports: [
    CommonModule,
    LoadingRequestStateTemplateDirectiveModule,
    ErrorRequestStateTemplateDirectiveModule,
    IdleRequestStateTemplateDirectiveModule,
    DefaultLoadingDirectiveModule,
    DefaultErrorDirectiveModule,
  ],
  declarations: [RequestStateTemplateComponent],
  exports: [
    RequestStateTemplateComponent,
    IdleRequestStateTemplateDirective,
    ErrorRequestStateTemplateDirective,
    LoadingRequestStateTemplateDirective,
  ],
})
export class RequestStateTemplateModule {}
