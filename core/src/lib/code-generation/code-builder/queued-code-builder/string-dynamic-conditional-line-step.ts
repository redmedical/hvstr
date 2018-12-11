import { CodeBuilder } from '../code-builder';
import { IQueueStep } from './queue-step';

/**
 * @private
 */
export class StringDynamicConditionalLineStep implements IQueueStep {
    constructor(private value: string, private conditionCreator: () => boolean){}
    execute(codeBuilder: CodeBuilder): void {
        if(this.conditionCreator()){
            codeBuilder.addLine(this.value);
        }
    }
}
