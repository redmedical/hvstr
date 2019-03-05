import { elementTreeMerge } from '../../../src/lib/e2e-element/element-tree-merge';
import { TreeExpression, treeExpressionToE2eElement } from '../../utils/e2eElementTreeExpression';

interface testCase {
    name: string;
    oldTree: TreeExpression[];
    addendTree: TreeExpression[];
    expectedTree: TreeExpression[];
}

describe('elementTreeMerge', () => {
    (<testCase[]>[
        {
            name: 'should not throw any error',
            oldTree: [],
            addendTree: [],
            expectedTree: [],
        },
        {
            name: 'should merge simple adjacent objects',
            oldTree: [{ a: [] }],
            addendTree: [{ b: [] }],
            expectedTree: [{ a: [] }, { b: [] }],
        },
        {
            name: 'should merge simple adjacent objects with children',
            oldTree: [{ c: [{ a: [] }] }],
            addendTree: [{ d: [{ b: [] }] }],
            expectedTree: [{ c: [{ a: [] }] }, { d: [{ b: [] }] }],
        },
        {
            name: 'should merge overlapping',
            oldTree: [{ a: [] }],
            addendTree: [{ a: [] }],
            expectedTree: [{ a: [] }],
        },
        {
            name: 'should merge simple adjacent objects with children',
            oldTree: [{ d: [{ a: [] }] }],
            addendTree: [{ d: [{ b: [] }] }],
            expectedTree: [{ d: [{ a: [] }, { b: [] }] }],
        },
        {
            name: 'should merge 3 levels of children objects overlapping',
            oldTree: [{ e: [{ d: [{ a: [] }] }] }],
            addendTree: [{ e: [{ d: [{ a: [] }, { b: [] }] }] }],
            expectedTree: [{ e: [{ d: [{ a: [] }, { b: [] }] }] }],
        },
        {
            name: 'should merge 3 levels of children objects adjacent',
            oldTree: [{ e: [{ d: [{ a: [] }] }] }],
            addendTree: [{ f: [{ d: [{ b: [] }] }] }],
            expectedTree: [{ e: [{ d: [{ a: [] }] }] }, { f: [{ d: [{ b: [] }] }] }],
        },
    ]).forEach(testCase => {
        it(testCase.name, () => {
            const oldTree = treeExpressionToE2eElement(testCase.oldTree);
            const newTree = treeExpressionToE2eElement(testCase.addendTree);
            const resultTree = treeExpressionToE2eElement(testCase.expectedTree);
            const result = elementTreeMerge(oldTree, newTree, [], false);
            expect(result).toEqualE2eElementTree(resultTree);
        });
    });
});
