import { Utils } from '@redmedical/hvstr-utils';

/**
 * @private
 */
export interface GetterFunction {
    functionName: string;
    parameters: { name: string, type: string }[];
}

/**
 * @private
 */
export function getParameterNameForElement(id: string): string {
    const isCamelArrayId = id.match(Utils.isCamelArrayId);
    let idResult = id;
    if (isCamelArrayId) {
        idResult = idResult.substr(0, idResult.length - 2);
    }
    return Utils.firstCharToLowerCase(idResult);
}
