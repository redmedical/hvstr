export class Utils {
    static readonly isCamelArrayId: RegExp = /^[A-Z][a-zA-Z0-9]*\[\]$/gm;
    static readonly isKebabArrayId: RegExp = /^([a-z][a-z]*[0-9]*)(-([a-z][a-z]*[0-9]*))*(\[\])$/gm;
    static readonly isValidCamelId: RegExp = /^[A-Z][a-zA-Z0-9]*(\[\])?$/gm;
    static readonly isValidKebabId: RegExp = /^([a-z][a-z]*[0-9]*)(-([a-z][a-z]*[0-9]*))*(\[\])?$/gm;

    static readonly getE2eElementTreeFunctionName: string = 'getE2eElementTree';
    static readonly getListFunctionName: string = 'getE2eElementList';

    static getCssClassFromKebabId(kebabId: String): string {
        const isKebabArrayId = kebabId.match(Utils.isKebabArrayId);
        let idResult = kebabId;
        if (isKebabArrayId) {
            idResult = kebabId.substr(0, kebabId.length - 2);
        }
        return 'e2e-' + idResult;
    }

    static firstCharToLowerCase(source: string): string {
        return source[0].toLocaleLowerCase() + source.substring(1, source.length);
    }

    static getFunctionNameForElement(id: string): string {
        const isCamelArrayId = id.match(this.isCamelArrayId);
        let idResult = id;
        if (isCamelArrayId) {
          idResult = idResult.substr(0, idResult.length - 2);
        }
        return 'get' + idResult;
    }
}
