import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import { CurrentFlowService } from '../current-flow.service';
import { FlowPageService } from '../flow-page.service';
import { ActivatedRoute } from '@angular/router';
import { INTEGRATION_SET_PROPERTY } from '../edit-page.models';
import { Flow } from '@syndesis/ui/platform';

@Component({
  selector: 'syndesis-integration-flow-toolbar',
  templateUrl: './flow-toolbar.component.html',
  styleUrls: ['../../integration-common.scss', './flow-toolbar.component.scss'],
})
export class FlowToolbarComponent {
  @Input() hideButtons = false;
  @ViewChild('nameInput') nameInput: ElementRef;

  @Input()
  flows: Flow[] = [];

  @Input()
  currentFlow: Flow = undefined;

  constructor(
    public currentFlowService: CurrentFlowService,
    public flowPageService: FlowPageService,
    public route: ActivatedRoute
  ) {}

  get saveInProgress() {
    return this.flowPageService.saveInProgress;
  }

  get publishInProgress() {
    return this.flowPageService.publishInProgress;
  }

  nameUpdated(name: string) {
    this.currentFlowService.events.emit({
      kind: INTEGRATION_SET_PROPERTY,
      property: 'name',
      value: name,
    });
  }

  flowNameUpdated(name: string) {
    this.currentFlow.name = name;
  }

  save(targetRoute: string[]) {
    this.flowPageService.save(
      this.route.firstChild,
      targetRoute || ['..', 'save-or-add-step']
    );
  }

  isMainFlow(flow: Flow) {
    return !this.isConditionalFlow(flow) && !this.isDefaultFlow(flow);
  }

  getFlowName(flow: Flow) {
    if (this.isConditionalFlow(flow)) {
      return flow.name || 'Conditional Flow';
    }

    if (this.isDefaultFlow(flow)) {
      return flow.name || 'Default Flow';
    }

    return 'Flow';
  }

  isConditionalFlow(flow: Flow) {
    return flow.metadata && flow.metadata['type'] === 'conditional';
  }

  getConditionalFlows(): Flow[] {
    const conditionalFlows = this.flows.filter(flow => this.isConditionalFlow(flow));

    // Add default flows to the very end of the list, ensures that default flows are always at the end of a group
    conditionalFlows.push(...this.flows.filter(flow => this.isDefaultFlow(flow)));

    // potentially we have many flows that belong to different steps, so group flows by step id
    const ids = [];
    const result = [];
    conditionalFlows.forEach(flow => {
      const stepId = flow.metadata['stepId'];
      const index = ids.indexOf(stepId);
      if (index > -1) {
        result[index].push(flow);
      } else {
        ids.push(stepId);
        result.push([flow]);
      }
    });

    return result.reduce((prev, curr) => {
      return prev.concat(curr);
    });
  }

  isDefaultFlow(flow: Flow) {
    return flow.metadata && flow.metadata['type'] === 'default';
  }

  publish() {
    this.flowPageService.publish(this.route.firstChild);
  }

  get currentStep() {
    return this.flowPageService.getCurrentStep(this.route);
  }
}