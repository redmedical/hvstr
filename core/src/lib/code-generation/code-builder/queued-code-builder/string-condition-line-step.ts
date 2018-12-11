import { CodeBuilder } from '../code-builder';
import { IQueueStep } from './queue-step';

/**
 * @private
 */
export class StringConditionalLineStep implements IQueueStep {
    constructor(private value: string, private condition: boolean){}
    execute(codeBuilder: CodeBuilder): void {
        if(this.condition) {
            codeBuilder.addLine(this.value);
        }
    }
}
