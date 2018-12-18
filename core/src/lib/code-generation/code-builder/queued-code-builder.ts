import { CodeBuilder } from './code-builder';
import { IQueueStep } from './queued-code-builder/queue-step';
import { StringLineStep } from './queued-code-builder/string-line-step';
import { StringLineConditionStep } from './queued-code-builder/string-line-condition-step';
import { StringLineDynamicConditionStep } from './queued-code-builder/string-line-dynamic-condition-step';
import { DynamicStringLineStep } from './queued-code-builder/dynamic-string-line-step';
import { IncreaseDepthStep } from './queued-code-builder/increase-depth-step';
import { DecreaseDepthStep } from './queued-code-builder/decrease-depth-step';

export class QueuedCodeBuilder{

    private queue: IQueueStep[];

    constructor(private tab: string) {
        this.queue = [];
    }

    getResult(): string {
        const cb = new CodeBuilder(this.tab);
        this.queue.forEach(step => step.execute(cb));
        return cb.getResult();
    }

    addLine(content: string): QueuedCodeBuilder {
        this.queue.push(new StringLineStep(content));
        return this;
    }

    addLineCondition(content: string, condition: boolean): QueuedCodeBuilder {
        this.queue.push(new StringLineConditionStep(content, condition));
        return this;
    }

    addLineDynamicCondition(content: string, condition: () => boolean): QueuedCodeBuilder {
        this.queue.push(new StringLineDynamicConditionStep(content, condition));
        return this;
    }

    addDynamicLine(content: () => string): QueuedCodeBuilder {
        this.queue.push(new DynamicStringLineStep(content));
        return this;
    }

    increaseDepth(): QueuedCodeBuilder {
        this.queue.push(new IncreaseDepthStep());
        return this;
    }

    decreaseDepth(): QueuedCodeBuilder {
        this.queue.push(new DecreaseDepthStep());
        return this;
    }

    reset(): QueuedCodeBuilder {
        this.queue = [];
        return this;
    }
}
