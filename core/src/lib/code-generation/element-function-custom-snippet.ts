import { E2eElement } from '../e2e-element/e2e-element';
import { QueuedCodeBuilder } from './code-builder/queued-code-builder';
import { Utils } from '@redmedical/hvstr-utils';
import { CaseConvert } from '../local-utils/case-converter';
import { GetterFunction, getParameterNameForElement } from '../e2e-element/getter-function';

/**
 * @private
 */
export function initCustomSnippet(): CustomSnippets {
  const rules: CustomSnippets = new CustomSnippets();
  rules.add({
    condition: () => true,
    callBack: async (
      element: E2eElement,
      codeBuilder: QueuedCodeBuilder,
      protractorImports: string[]
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

      if (!protractorImports.find(x => x === functionReturnType)) {
        protractorImports.push(functionReturnType);
      }

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
  return rules;
}


/**
 * CustomSnippets are providing the possibility, to add custom code to your page-object, for matching elements.
 *
 * @export
 * @class CustomSnippets
 */
export class CustomSnippets{
  private allCustomSnippet: ICustomSnippet[] = [];
  /**
   * adds a new CustomSnippet to the list of CustomSnippets, which will be used.
   *
   * @param {ICustomSnippet} customSnippet
   * @memberof CustomSnippets
   */
  public add(customSnippet: ICustomSnippet): void{
    this.allCustomSnippet.push(customSnippet);
  }
  /**
   * @private
   */
  public execute(
    element: E2eElement,
    codeBuilder: QueuedCodeBuilder,
    protractorImports: string[],
  ): void {
    for (let i: number = 0; i < this.allCustomSnippet.length; i++) {
      if(this.allCustomSnippet[i].condition(element)) {
        this.allCustomSnippet[i].callBack(element,codeBuilder,protractorImports);
      }
    }
  }
}


/**
 * represents a CustomSnippet.
 *
 * @interface ICustomSnippet
 */
interface ICustomSnippet {
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
   * @param {string[]} protractorImports List of all imports from protractors. It can be extendet, when more are needed.
   * @memberof ICustomSnippet
   */
  callBack: (
    element: E2eElement,
    codeBuilder: QueuedCodeBuilder,
    protractorImports: string[],
  ) => Promise<void>;
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
