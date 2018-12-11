import { CodeBuilder } from '../code-builder';
import { IQueueStep } from './queue-step';

/**
 * @private
 */
export class DynamicStringLineStep implements IQueueStep {
    constructor(private stringValueCreator: () => string){}
    execute(codeBuilder: CodeBuilder): void {
        codeBuilder.addLine(this.stringValueCreator());
    }
}
