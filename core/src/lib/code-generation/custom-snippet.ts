import { E2eElement } from '../e2e-element/e2e-element';
import { QueuedCodeBuilder } from './code-builder/queued-code-builder';
import { Utils } from '@redmedical/hvstr-utils';
import { CaseConvert } from '../local-utils/case-converter';
import { GetterFunction, getParameterNameForElement } from '../e2e-element/getter-function';
import { IPageObjectBuilderOptions } from '../page-object-builder-options';

/**
 * @private
 */
export function initCustomSnippet(): CustomSnippets {
    const defaultCustomSnippets: CustomSnippets = new CustomSnippets();
    defaultCustomSnippets.addForGetterFunctions({
        condition: () => true,
        callBack: async (
            element: E2eElement,
            codeBuilder: QueuedCodeBuilder,
            options: IPageObjectBuilderOptions,
        ) => {
            const isCamelArrayId = Utils.isCamelArrayId.test(element.id);
            let idResult = element.id;
            let parameters: { name: string; type: string }[] = [];
            const functionName = Utils.getFunctionNameForElement(
                element.conflictFreeId || element.id
            );
            let selectorSource: string;
            let functionReturnType: string;
            if (isCamelArrayId) {
                idResult = idWithoutArrayAnnotation(idResult);
                functionReturnType = 'ElementArrayFinder';
            } else {
                functionReturnType = 'ElementFinder';
            }

            codeBuilder.addImport(functionReturnType, 'protractor');

            if (element.parentElement) {
                const parentGetterFunction = element.parentElement!
                    .getterFunction!;
                parameters = [...parentGetterFunction.parameters];

                let selectorSourceSubSelector = '';
                if (element.parentElement.isArrayElement) {
                    const getterIndexParameterVariableName = getGetterIndexParameterVariableName(element);
                    parameters.push({
                        name: getterIndexParameterVariableName,
                        type: 'number'
                    });
                    selectorSourceSubSelector = `.get(${getterIndexParameterVariableName})`;
                }

                const parentGetterFunctionParameters = parentGetterFunction.parameters
                    .map(x => x.name)
                    .join(', ');
                selectorSource = `this.${
                    parentGetterFunction.functionName
                    }(${parentGetterFunctionParameters})${selectorSourceSubSelector}`;
                selectorSource += isCamelArrayId ? '.all' : '.element';
            } else if (options.enableCustomBrowser) {
                selectorSource = isCamelArrayId ? 'this.browser.element.all' : 'this.browser.element';
            } else {
                selectorSource = isCamelArrayId ? 'element.all' : 'element';
            }

            const parameterString = parameters
                .map(x => x.name + ': ' + x.type)
                .join(', ');

            codeBuilder
                .addConditionalLine(
                    `${functionName}(${parameterString}): ${functionReturnType} {`,
                    !element.isPrivate
                )
                .addConditionalLine(
                    `private ${functionName}(${parameterString}): ${functionReturnType} {`,
                    element.isPrivate
                )
                .increaseDepth()
                .addLine(
                    `return ${selectorSource}(by.css('.${Utils.getCssClassFromKebabId(
                        CaseConvert.fromPascal.toKebab(element.pureId)
                    )}'));`
                )
                .decreaseDepth()
                .addLine(`}`);
            const newGetterFunction: GetterFunction = {
                functionName,
                parameters
            };
            element.getterFunction = newGetterFunction;
        }
    });
    defaultCustomSnippets.addForFillForm({
        condition: (element) => element.type === 'INPUT',
        callBack: async (
            element: E2eElement,
            codeBuilder: QueuedCodeBuilder,
            options: IPageObjectBuilderOptions,
        ) => {
            if (isArrayLikeElement(element)) {
                options.logger.logWarn('no Support for array-like elements in fillForm!');
                return;
            }
            codeBuilder
                .addLine(`if (data.${Utils.firstCharToLowerCase(element.pureId)}) {`)
                .increaseDepth()
                .addLine(`await this.get${element.id}().sendKeys(data.${Utils.firstCharToLowerCase(element.id)});`)
                .decreaseDepth()
                .addLine('}');
        },
        type: 'string',
    });
    defaultCustomSnippets.addForClearForm({
        condition: (element) => element.type === 'INPUT',
        callBack: async (
            element: E2eElement,
            codeBuilder: QueuedCodeBuilder,
            options: IPageObjectBuilderOptions,
        ) => {
            if (isArrayLikeElement(element)) {
                options.logger.logWarn('no Support for array-like elements in clearForm!');
                return;
            }
            codeBuilder
                .addImport('protractor', 'protractor/built/ptor')
                .addLine('{')
                .increaseDepth()
                .addLine(`const input = this.get${element.id}();`)
                .addLine(`const value: string = await input.getAttribute('value');`)
                .addLine('for (let i = 0; i < value.length; i++) {')
                .increaseDepth()
                .addLine('await input.sendKeys(protractor.Key.BACK_SPACE);')
                .decreaseDepth()
                .addLine('}')
                .decreaseDepth()
                .addLine('}');
        },
    });
    return defaultCustomSnippets;
}


/**
 * CustomSnippets are providing the possibility, to add custom code to your page-object, for matching elements.
 *
 * @export
 * @class CustomSnippets
 */
export class CustomSnippets {
    private getterFunctionCustomSnippet: ICustomSnippet[] = [];
    private fillFormCustomSnippet: ICustomSnippet[] = [];
    private clearFormCustomSnippet: ICustomSnippet[] = [];
    /**
     * adds a new CustomSnippet to the list of CustomSnippets, which will be used.
     *
     * @param {ICustomSnippet} customSnippet
     * @memberof CustomSnippets
     */
    public addForGetterFunctions(customSnippet: ICustomSnippet): void {
        this.getterFunctionCustomSnippet.push(customSnippet);
    }
    /**
     * adds a new CustomSnippet to the list of CustomSnippets, which will be used.
     *
     * @param {ICustomSnippet} customSnippet
     * @memberof CustomSnippets
     */
    public addForFillForm(customSnippet: Required<ICustomSnippet>): void {
        this.fillFormCustomSnippet.push(customSnippet);
    }
    /**
     * adds a new CustomSnippet to the list of CustomSnippets, which will be used.
     *
     * @param {ICustomSnippet} customSnippet
     * @memberof CustomSnippets
     */
    public addForClearForm(customSnippet: ICustomSnippet): void {
        this.clearFormCustomSnippet.push(customSnippet);
    }
    /**
     * @private
     */
    public execute(
        element: E2eElement,
        codeBuilder: QueuedCodeBuilder,
        options: IPageObjectBuilderOptions,
        snippetsFor: 'getterFunction' | 'fillForm' | 'clearForm',
    ): void {
        const snippetCollection =
            snippetsFor === 'getterFunction' ? this.getterFunctionCustomSnippet :
                snippetsFor === 'fillForm' ? this.fillFormCustomSnippet :
                    this.clearFormCustomSnippet;
        for (let i: number = 0; i < snippetCollection.length; i++) {
            if (snippetCollection[i].condition(element)) {
                snippetCollection[i].callBack(element, codeBuilder, options);
            }
        }
    }
    /**
     * @private
     */
    public exists(
        element: E2eElement,
        snippetsFor: 'getterFunction' | 'fillForm' | 'clearForm',
    ): boolean {
        const snippetCollection =
            snippetsFor === 'getterFunction' ? this.getterFunctionCustomSnippet :
                snippetsFor === 'fillForm' ? this.fillFormCustomSnippet :
                    this.clearFormCustomSnippet;
        for (let i: number = 0; i < snippetCollection.length; i++) {
            if (snippetCollection[i].condition(element)) {
                return true;
            }
        }
        return false;
    }
    /**
     * @private
     */
    public types(
        element: E2eElement,
    ): string {
        const snippetCollection = this.fillFormCustomSnippet;
        const types: string[] = [];
        for (let i: number = 0; i < snippetCollection.length; i++) {
            if (snippetCollection[i].condition(element)) {
                const snippetType = snippetCollection[i].type || 'any';
                if (!types.includes(snippetType)) {
                    types.push(snippetType);
                }
            }
        }
        return types.join(' | ');
    }
}

/**
 * represents a CustomSnippet.
 *
 * @interface ICustomSnippet
 */
export interface ICustomSnippet {
    /**
     * A function which returns true, when the custom snippet should be used.
     *
     * Example:
     * ```ts
     * (element) => element.type === 'BUTTON'
     * ```
     *
     * @param {E2eElement} element The element, for which the page-object code is actually generated.
     * @memberof ICustomSnippet
     */
    condition: (element: E2eElement) => boolean;
    /**
     * The callBack adds the new code to the codeBuilder.
     *
     * @param {E2eElement} element The element, for which the page-object code is actually generated.
     * @param {QueuedCodeBuilder} codeBuilder The codeBuilder, which generates the page-object.
     * @memberof ICustomSnippet
     */
    callBack: (
        element: E2eElement,
        codeBuilder: QueuedCodeBuilder,
        options: IPageObjectBuilderOptions
    ) => Promise<void>;
    /**
     * The type expected for FillFormParameters
     *
     * @type {string}
     * @memberof ICustomSnippet
     */
    type?: string;
}

/**
 * @private
 */
function isArrayLikeElement(element: E2eElement): boolean {
    const isCamelArrayId = Utils.isCamelArrayId.test(element.id);
    const hasParameters = element.getterFunction!.parameters.length !== 0;
    return  hasParameters || isCamelArrayId;
}

/**
 * @private
 */
function getGetterIndexParameterVariableName(element: E2eElement): string {
    return Utils.firstCharToLowerCase(getParameterNameForElement(element.parentElement!.id)) + 'Index';
}

/**
 * @private
 */
function idWithoutArrayAnnotation(idResult: string): string {
    const arrayAnnotationLength = 2;
    return idResult.substr(0, idResult.length - arrayAnnotationLength);
}
