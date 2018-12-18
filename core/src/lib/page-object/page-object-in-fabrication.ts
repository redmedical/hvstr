import { E2eElement } from '../e2e-element/e2e-element';
import { IGenerationInstruction } from '../local-utils/generation-instruction';
import { Path } from '../local-utils/path';
import { IChildPage } from './child-page';

export interface IPageObjectInFabrication {
    [key: string]: any;
    e2eElementTree: E2eElement[];
    name: string;
    origin: IPageObjectInFabrication | undefined;
    instruct: IGenerationInstruction;
    childPages: IChildPage[];
    route?: string;
    hasFillForm: boolean;
    generatedPageObjectPath: Path;
    generatedExtendingPageObjectPath: Path;
    append(instruct: IGenerationInstruction): Promise<IPageObjectInFabrication>;
    appendChild(instruct: IGenerationInstruction): Promise<IPageObjectInFabrication> ;
    addNavigateTo(): Promise<IPageObjectInFabrication>;
    addFillForm(): Promise<IPageObjectInFabrication>;
}
