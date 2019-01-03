import { E2eElement } from '../e2e-element/e2e-element';
import { ConflictElement } from './conflict-element';

/**
 * @private
 */
export class ConflictTree {
    public less: ConflictTree | undefined;
    public greater: ConflictTree | undefined;
    public id: string;
    public elements: E2eElement[];
    constructor(element: E2eElement, public conflictList: ConflictTree[] = []) {
        this.elements = [element];
        this.id = element.id;
    }
    public insert(element: E2eElement): ConflictTree {
        switch (this.id.localeCompare(element.id)) {
            case 0:
                if (this.elements.length === 1) {
                    this.conflictList.push(this);
                }
                this.elements.push(element);
                break;
            case 1:
                if (this.greater) {
                    this.greater!.insert(element);
                } else {
                    this.greater = new ConflictTree(element, this.conflictList);
                }
                break;
            case -1:
                if (this.less) {
                    this.less!.insert(element);
                } else {
                    this.less = new ConflictTree(element, this.conflictList);
                }
                break;
        }
        return this;
    }

    getConflicts(): ConflictElement[] {
        return this.elements.map(x => new ConflictElement(x));
    }
}
