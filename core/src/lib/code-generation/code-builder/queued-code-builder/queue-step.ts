import { CodeBuilder } from '../code-builder';

export interface IQueueStep {
    execute(codeBuilder: CodeBuilder): void;
}
