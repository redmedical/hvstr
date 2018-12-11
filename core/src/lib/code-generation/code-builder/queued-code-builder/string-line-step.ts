import { CodeBuilder } from '../code-builder';
import { IQueueStep } from './queue-step';

/**
 * @private
 */
export class StringLineStep implements IQueueStep {
    constructor(private value: string){}
    execute(codeBuilder: CodeBuilder): void {
        codeBuilder.addLine(this.value);
    }
}
