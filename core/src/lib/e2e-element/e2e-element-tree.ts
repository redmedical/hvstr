import { E2eElement } from './e2e-element';
import { IE2eElement } from '@redmedical/hvstr-utils';
import { elementTreeMerge } from './element-tree-merge';
import { mergeDuplicateArrayElements } from '../conflict-resolver/array-duplicate-merge';
import { ConflictResolver } from '../conflict-resolver/conflict-resolver';
import { restrictor } from './restrictor';

/**
 * @private
 */
export class E2eElementTree {
    public tree: E2eElement[];
    constructor(source: IE2eElement[]) {
        this.tree = source.map(x => new E2eElement(x));
    }
    mergeTo(mergeRoot: E2eElementTree | E2eElement[], parent?: E2eElement): E2eElementTree {
        if (mergeRoot instanceof E2eElementTree) {
            this.tree = elementTreeMerge(mergeRoot.tree, this.tree, parent);
        } else {
            this.tree = elementTreeMerge(mergeRoot, this.tree, parent);
        }
        return this;
    }
    mergeDuplicateArrayElements(): E2eElementTree {
        mergeDuplicateArrayElements(this.tree);
        return this;
    }
    resolveConflicts(): E2eElementTree {
        ConflictResolver(this.tree);
        return this;
    }
    restrict(excludeElements?: string[], restrictToElements?: string[]): E2eElementTree {
        this.tree = restrictor(this.tree, excludeElements, restrictToElements);
        return this;
    }
}
