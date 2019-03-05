import { mergeDuplicateArrayElements } from '../../../src/lib/conflict-resolver/array-duplicate-merge';
import { E2eElement } from '../../../src/lib/e2e-element/e2e-element';
import { TreeExpression, treeExpressionToE2eElement } from '../../utils/e2eElementTreeExpression';

interface testCase {
    name: string;
    inputTree: TreeExpression[];
    expectedTree: TreeExpression[];
}

describe('mergeDuplicateArrayElements', () => {
    (<testCase[]>[
        {
            name: 'should not throw any error',
            inputTree: [],
            expectedTree: [],
        },
        {
            name: 'should ignore simple object',
            inputTree: [{ A: [] }],
            expectedTree: [{ A: [] }],
        },
        {
            name: 'should ignore separate trees without array duplicates',
            inputTree: [{ A: [{ B: [] }] }, { C: [{ D: [] }] }],
            expectedTree: [{ A: [{ B: [] }] }, { C: [{ D: [] }] }],
        },
        {
            name: 'should merge simple array duplicate',
            inputTree: [{ 'A[]': [] }, { 'A[]': [] }],
            expectedTree: [{ 'A[]': [] }],
        },
        {
            name: 'should leave single array tagged',
            inputTree: [{ 'A[]': [] }],
            expectedTree: [{ 'A[]': [] }],
        },
        {
            name: 'should merge children of array duplicate',
            inputTree: [{ 'A[]': [{ B: [] }] }, { 'A[]': [{ C: [] }] }],
            expectedTree: [{ 'A[]': [{ B: [] }, { C: [] }] }],
        },
        {
            name: 'should merge array duplicates, which are children',
            inputTree: [{ A: [{ 'C[]': [] }, { 'C[]': [] }] }],
            expectedTree: [{ A: [{ 'C[]': [] }] }],
        },
        {
            name: 'should merge different array duplicates with name conflict as children with diff. parents separate.',
            inputTree: [{ A: [{ B: [{ 'C[]': [] },{ 'C[]': [] }] }] }, { D: [{ 'C[]': [] }, { 'C[]': [] }] }],
            expectedTree: [{ A: [{ B: [{ 'C[]': [] }] }] }, { D: [{ 'C[]': [] }] }],
        },
    ]).forEach(testCase => {
        it(testCase.name, () => {
            let tree: E2eElement[] = treeExpressionToE2eElement(testCase.inputTree);
            mergeDuplicateArrayElements(tree);
            expect(tree).toEqualE2eElementTree(treeExpressionToE2eElement(testCase.expectedTree));
        });
    });
});
