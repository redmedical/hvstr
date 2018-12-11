import { E2eElement } from '../e2e-element/e2e-element';
/**
 * @private
 */
export class ConflictElement {

    public maybeParentPath: parentPathStep[] | undefined;

    constructor(
        public element: E2eElement,
    ){}

    resolveParentPath(): ConflictElement {
        this.maybeParentPath = [];
        let actualElement: E2eElement | undefined = this.element;
        while (actualElement) {
            this.maybeParentPath.push({element: actualElement, isConflictRoot: actualElement === this.element});
            actualElement = actualElement.parentElement;
        }
        return this;
    }

    findConflictRoot(otherConflictElement: ConflictElement): ConflictElement {
        if(!this.maybeParentPath || !otherConflictElement.maybeParentPath){
            throw 'cannot find conflict-root, without parent-path. Run "resolveParentPath()" first';
        }
        const parentPath: parentPathStep[] = this.maybeParentPath!;
        const otherParentPath: parentPathStep[] = otherConflictElement.maybeParentPath!;

        for (let i = 1; i <= parentPath.length && i <= otherParentPath.length; i++) {
            const localPathStep = parentPath[parentPath.length - i];
            const otherPathStep = otherParentPath[otherParentPath.length - i];
            if (localPathStep.element !== otherPathStep.element) {
                localPathStep.isConflictRoot = true;
                otherPathStep.isConflictRoot = true;
                return this;
            }
        }
        throw {message: 'an Conflicting Element is Children from other.', conflictingElements: [this.element, otherConflictElement.element]};
    }

    setConflictFreeId(): ConflictElement {
        if(!this.maybeParentPath){
            throw 'cannot set conflict free Id, without parent-path. Run "resolveParentPath()" first';
        }
        const parentPath: parentPathStep[] = this.maybeParentPath!;
        this.element.conflictFreeId = parentPath.filter(x => x.isConflictRoot).reverse().map(x=> x.element.pureId).join('');
        return this;
    }
}

/**
 * @private
 */
interface parentPathStep {
    element: E2eElement;
    isConflictRoot: boolean;
}
