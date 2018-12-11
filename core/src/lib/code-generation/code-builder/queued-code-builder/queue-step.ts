import { CodeBuilder } from '../code-builder';

/**
 * @private
 */
export interface IQueueStep {
    execute(codeBuilder: CodeBuilder): void;
}
