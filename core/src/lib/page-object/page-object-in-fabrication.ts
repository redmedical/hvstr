import { E2eElement } from '../e2e-element/e2e-element';
import { IGenerationInstruction } from '../local-utils/generation-instruction';
import { Path } from '../local-utils/path';
import { IChildPage } from './child-page';

/**
 * The IPageObjectInFabrication is an interface, which contains generated page-objects, helper methods and some internal data.
 * The IPageObjectInFabrication contains the ```[key: string]: any;``` interface.
 * It has all generated function and child page-objects from the generated page-object.
 *
 * @export
 * @interface IPageObjectInFabrication
 */
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
    historyUid: number;
    /**
     * appends content to this page-object
     *
     * @param {IGenerationInstruction} instruct
     * @returns {Promise<IPageObjectInFabrication>}
     * @memberof IPageObjectInFabrication
     */
    append(instruct: IGenerationInstruction): Promise<IPageObjectInFabrication>;

    /**
     * appends child object as composition to this page-object
     *
     * @param {IGenerationInstruction} instruct
     * @returns {Promise<IPageObjectInFabrication>}
     * @memberof IPageObjectInFabrication
     */
    appendChild(instruct: IGenerationInstruction): Promise<IPageObjectInFabrication>;

    /**
     * adds navigate to method to this page-object
     *
     * @returns {Promise<IPageObjectInFabrication>}
     * @memberof IPageObjectInFabrication
     */
    addNavigateTo(): Promise<IPageObjectInFabrication>;

    /**
     * adds fillForm and clearForm method to this page-object
     *
     * @returns {Promise<IPageObjectInFabrication>}
     * @memberof IPageObjectInFabrication
     */
    addFillForm(): Promise<IPageObjectInFabrication>;
}
