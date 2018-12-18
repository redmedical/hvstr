import { CodeBuilder } from '../code-builder';
import { IQueueStep } from './queue-step';

export class IncreaseDepthStep implements IQueueStep {
    execute(codeBuilder: CodeBuilder): void {
        codeBuilder.increaseDepth();
    }
}
