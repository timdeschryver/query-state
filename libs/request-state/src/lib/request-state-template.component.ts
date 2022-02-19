import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ContentChildren,
  Input,
  NgModule,
  QueryList,
  TemplateRef,
} from '@angular/core';
import { RequestStateData } from 'request-state-contracts';
import { DefaultErrorDirectiveModule } from './default-error.directive';
import { DefaultLoadingDirectiveModule } from './default-loading.directive';
import {
  RequestStateTemplateDirective,
  RequestStateTemplateDirectiveModule,
} from './request-state-template.directive';

@Component({
  selector: 'request-state-template',
  template: `
    <ng-container *ngIf="requestState">
      <ng-container [ngSwitch]="requestState.state">
        <ng-container *ngSwitchCase="'loading'">
          <ng-container *ngIf="loadingTemplate; else defaultLoading">
            <ng-container *ngTemplateOutlet="loadingTemplate"></ng-container>
          </ng-container>

          <ng-template #defaultLoading>
            <ng-template rsDefaultLoading></ng-template>
          </ng-template>
        </ng-container>

        <ng-container *ngSwitchCase="'error'">
          <ng-container *ngIf="errorTemplate; else defaultError">
            <ng-container
              *ngTemplateOutlet="
                errorTemplate;
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
                idleTemplate;
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
export class RequestStateTemplateComponent implements AfterContentInit {
  @ContentChildren(RequestStateTemplateDirective)
  templates!: QueryList<RequestStateTemplateDirective>;

  @Input() requestState?: RequestStateData<unknown> | null;

  loadingTemplate?: TemplateRef<unknown>;
  errorTemplate?: TemplateRef<unknown>;
  idleTemplate?: TemplateRef<unknown>;

  ngAfterContentInit(): void {
    this.templates.forEach((item) => {
      switch (item.rsRequestState) {
        case 'loading':
          this.loadingTemplate = item.templateRef;
          break;
        case 'error':
          this.errorTemplate = item.templateRef;
          break;
        case 'idle':
          this.idleTemplate = item.templateRef;
          break;
      }
    });
  }
}

@NgModule({
  imports: [
    CommonModule,
    RequestStateTemplateDirectiveModule,
    DefaultLoadingDirectiveModule,
    DefaultErrorDirectiveModule,
  ],
  declarations: [RequestStateTemplateComponent],
  exports: [RequestStateTemplateComponent, RequestStateTemplateDirective],
})
export class RequestStateTemplateModule {}
