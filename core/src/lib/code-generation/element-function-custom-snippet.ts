import { E2eElement } from '../e2e-element/e2e-element';
import { QueuedCodeBuilder } from './code-builder/queued-code-builder';
import { Utils } from '@redmedical/HVSTR-utils';
import { CaseConvert } from '../local-utils/case-converter';
import { GetterFunction, getParameterNameForElement } from '../e2e-element/getter-function';

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
        .addLine(
          `${functionName}(${parameterString}): ${functionReturnType} {`
        )
        .increaseDepth()
        .addLine(
          `return ${selectorSource}(by.css('.${Utils.getCssClassFromKebabId(
            CaseConvert.fromPascal.toKebab(element.id)
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

export class CustomSnippets{
  private allCustomSnippet: ICustomSnippet[] = [];
  public add(customSnippet: ICustomSnippet): void{
    this.allCustomSnippet.push(customSnippet);
  }
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

interface ICustomSnippet {
  condition: (element: E2eElement) => boolean;
  callBack: (
    element: E2eElement,
    codeBuilder: QueuedCodeBuilder,
    protractorImports: string[],
  ) => Promise<void>;
}
function getGetterIndexParameterVariableName(element: E2eElement): string {
  return Utils.firstCharToLowerCase(getParameterNameForElement(element.parentElement!.id)) + 'Index';
}

function idWithoutArrayAnnotation(idResult: string): string {
  const arrayAnnotationLength = 2;
  return idResult.substr(0, idResult.length - arrayAnnotationLength);
}
