import { CommonModule } from '@angular/common';
import { Component, ContentChild, Input, NgModule } from '@angular/core';
import { RequestStateData } from 'request-state-contracts';
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
    <ng-container *ngIf="requestState">
      <ng-container [ngSwitch]="requestState.state">
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
                  $implicit: requestState.error,
                  error: requestState.error
                }
              "
            ></ng-container>
          </ng-container>

          <ng-template #defaultError>
            <ng-template [rsDefaultError]="requestState.error"></ng-template>
          </ng-template>
        </ng-container>

        <ng-container *ngSwitchDefault>
          <ng-container *ngIf="idleTemplate">
            <ng-container
              *ngTemplateOutlet="
                idleTemplate.templateRef;
                context: {
                  $implicit: requestState.data,
                  state: requestState.data,
                  revalidating: requestState.state === 'revalidate'
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
export class RequestStateTemplateComponent<T> {
  @Input() requestState?: RequestStateData<T> | null;

  @ContentChild(LoadingRequestStateTemplateDirective)
  loadingTemplate?: LoadingRequestStateTemplateDirective;

  @ContentChild(ErrorRequestStateTemplateDirective)
  errorTemplate?: ErrorRequestStateTemplateDirective;

  @ContentChild(IdleRequestStateTemplateDirective)
  idleTemplate?: IdleRequestStateTemplateDirective<T>;
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
