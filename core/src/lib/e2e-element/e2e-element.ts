import { IE2eElement, Utils } from '@redmedical/HVSTR-utils';
import { GetterFunction } from './getter-function';
import { CaseConvert } from '../local-utils/case-converter';

/**
 * @private
 */
export class E2eElement {
    public idInput: string;
    public conflictFreeId: string;
    public parentElement?: E2eElement;
    public type: string;
    public nativeElement: Element;
    public children: E2eElement[];
    public getterFunction: GetterFunction | undefined;

    constructor(
        data: IE2eElement,
        parent?: E2eElement,
    ){
        this.idInput = data.id;
        this.type = data.type;
        this.nativeElement = data.nativeElement;
        this.conflictFreeId = this.id;
        this.children = data.children.map(x => new E2eElement(x, this));
        this.parentElement = parent;
    }

    public get isArrayElement(): boolean {
        return Boolean(this.id.match(Utils.isCamelArrayId));
    }

    public get id(): string {
        return CaseConvert.fromKebab.toPascal(this.idInput);
    }

    public get pureId(): string {
        const isCamelArrayId = this.id.match(Utils.isCamelArrayId);
        let idResult = this.id;
        if (isCamelArrayId) {
          idResult = idResult.substr(0, idResult.length - 2);
        }
        return idResult;
    }
}
