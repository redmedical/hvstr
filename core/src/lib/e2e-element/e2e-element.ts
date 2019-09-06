import { ISimpleE2EElement, Utils } from '@redmedical/hvstr-utils';
import { GetterFunction } from './getter-function';
import { CaseConvert } from '../local-utils/case-converter';

/**
 * @private
 */
export class E2eElement {
    public idInput: string;
    public parentElement?: E2eElement;
    /**
     * the html type of that element. It is always written in UPPER-CASE.
     *
     * @type {string}
     * @memberof E2eElement
     */
    public type: string;
    public children: E2eElement[];
    public getterFunction: GetterFunction | undefined;
    public isPrivate: boolean = false;
    private _conflictFreeId: string | undefined;

    constructor(
        data: ISimpleE2EElement,
        parent?: E2eElement,
    ){
        this.idInput = data.id;
        this.type = data.type.toUpperCase();
        this.children = data.children.map((x: ISimpleE2EElement) => new E2eElement(x, this));
        this.parentElement = parent;
    }

    public get isArrayElement(): boolean {
        return Boolean(this.id.match(Utils.isCamelArrayId));
    }

    public set conflictFreeId(value: string) {
        this._conflictFreeId = value;
    }

    public get conflictFreeId(): string {
        if (this.isPrivate) {
            return this._conflictFreeId ? '_' + this._conflictFreeId : this.id;
        } else {
            return this._conflictFreeId || this.id;
        }
    }

    public get id(): string {
        if(this.isPrivate) {
            return '_' + CaseConvert.fromKebab.toPascal(this.idInput);
        } else {
            return CaseConvert.fromKebab.toPascal(this.idInput);
        }
    }

    public get pureId(): string {
        let id = CaseConvert.fromKebab.toPascal(this.idInput);
        const isCamelArrayId = id.match(Utils.isCamelArrayId);
        if (isCamelArrayId) {
          id = id.substr(0, id.length - 2);
        }
        return id;
    }
}
