import { CodeBuilder } from '../code-builder';
import { IQueueStep } from './queue-step';

export class StringLineDynamicConditionStep implements IQueueStep {
    constructor(private value: string, private conditionCreator: () => boolean){}
    execute(codeBuilder: CodeBuilder): void {
        if(this.conditionCreator()){
            codeBuilder.addLine(this.value);
        }
    }
}
