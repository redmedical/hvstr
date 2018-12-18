import { CodeBuilder } from '../code-builder';
import { IQueueStep } from './queue-step';

export class DecreaseDepthStep implements IQueueStep {
    execute(codeBuilder: CodeBuilder): void {
        codeBuilder.decreaseDepth();
    }
}
