import { CodeBuilder } from '../code-builder';
import { IQueueStep } from './queue-step';

/**
 * @private
 */
export class IncreaseDepthStep implements IQueueStep {
    execute(codeBuilder: CodeBuilder): void {
        codeBuilder.increaseDepth();
    }
}
