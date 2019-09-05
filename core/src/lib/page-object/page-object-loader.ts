import { IGenerationInstruction } from '../local-utils/generation-instruction';
import { IPageObjectInFabrication } from './page-object-in-fabrication';
import * as ts from 'typescript';
import { PageObjectBuilder } from '../page-object-builder';
import { Path } from '../local-utils/path';
import { IChildPage } from './child-page';
import { CaseConvert } from '../local-utils/case-converter';
import { E2eElementTree } from '../e2e-element/e2e-element-tree';

/**
 * @private
 */
const requireFromString = require('require-from-string');

/**
 * @private
 */
export function compilePageObject(tsCode: string): string {
    const result = ts.transpileModule(tsCode, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
    return result.outputText;
}

/**
 * @private
 */
export function requirePageObject(params: IPageObjLoadParams): IPageObjectInFabrication {
    const pageDef = requireFromString(params.jsCode, {
        appendPaths: [],
    });
    const result: IPageObjectInFabrication = new pageDef['Generated' + params.pageObjectName]();
    setResultMethodeAttributes(result, params.pageObjectBuilder);
    setResultAttributes(result, params);
    return result;
}

/**
 * @private
 */
function setResultMethodeAttributes(result: IPageObjectInFabrication, pageObjectBuilder: PageObjectBuilder): void {
    result.append = (instruct: IGenerationInstruction) => pageObjectBuilder.append(instruct, result);
    result.appendChild = (instruct: IGenerationInstruction) => pageObjectBuilder.appendChild(instruct, result);
    result.addNavigateTo = () => pageObjectBuilder.addNavigateTo(result);
    result.addFillForm = () => pageObjectBuilder.addFillForm(result);
}

/**
 * @private
 */
function setResultAttributes(
    result: IPageObjectInFabrication,
    params: IPageObjLoadParams
): void {
    result.e2eElementTree = params.e2eElementTree;
    result.name = params.pageObjectName;
    result.origin = params.origin;
    result.instruct = params.instruct;
    result.childPages = params.childPages;
    result.hasFillForm = params.hasFillForm;
    result.generatedPageObjectPath = params.generatedPageObjectPath;
    result.generatedExtendingPageObjectPath = params.generatedExtendingPageObjectPath;
    result.historyUid = params.useHistoryUid !== undefined ? params.useHistoryUid : params.pageObjectBuilder.historyUidCounter;
    if (params.origin) {
        params.origin!.childPages.forEach(childPage => {
            const childName = CaseConvert.fromPascal.toCamel(childPage.name);
            result[childName] = params.origin![childName];
        });
    }
    if (params.newChild) {
        const childName = CaseConvert.fromPascal.toCamel(params.newChild!.name);
        result[childName] = params.newChild;
    }
}

/**
 * @private
 */
interface IPageObjLoadParams {
    instruct: IGenerationInstruction;
    pageObjectName: string;
    jsCode: string;
    e2eElementTree: E2eElementTree;
    childPages: IChildPage[];
    origin?: IPageObjectInFabrication;
    newChild?: IPageObjectInFabrication;
    pageObjectBuilder: PageObjectBuilder;
    hasFillForm: boolean;
    generatedPageObjectPath: Path;
    generatedExtendingPageObjectPath: Path;
    useHistoryUid?: number;
}
