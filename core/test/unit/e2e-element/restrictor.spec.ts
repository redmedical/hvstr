import { E2eElement } from '../../../src/lib/e2e-element/e2e-element';
import { TreeExpression, treeExpressionToE2eElement } from '../../utils/e2eElementTreeExpression';
import { restrictor } from '../../../src/lib/e2e-element/restrictor';

interface testCase {
    name: string;
    inputTree: TreeExpression[];
    expectedTree: TreeExpression[];
    focused?: boolean;
    excludeElements?: string[];
    restrictToElements?: string[];
}

describe('mergeDuplicateArrayElements', () => {
    (<testCase[]>[
        {
            name: 'should not throw any error',
            inputTree: [],
            expectedTree: [],
        },
        {
            name: 'should not exclude or restrict #1',
            inputTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
            expectedTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
        },
        {
            name: 'should not exclude or restrict #2',
            inputTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
            expectedTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
            excludeElements: [],
        },
        {
            name: 'should not exclude or restrict #3',
            inputTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
            expectedTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
            restrictToElements: [],
        },
        {
            name: 'should not exclude or restrict #4',
            inputTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
            expectedTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
            restrictToElements: [],
            excludeElements: [],
        },
        {
            name: 'should restrict to simple tree branch',
            inputTree: [{ A: [], B: [] }],
            expectedTree: [{ A: [] }],
            restrictToElements: ['A']
        },
        {
            name: 'should restrict to tree with children',
            inputTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
            expectedTree: [{ A: [{ C: [], D: [{ F: [] }] }] }],
            restrictToElements: ['A'],
        },
        {
            name: 'should restrict to tree with children and mark parent elements as private',
            inputTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
            expectedTree: [{ '_B': [{ E: [] }] }],
            restrictToElements: ['E'],
        },
        {
            name: 'should restrict to tree with children and mark parent elements as private and exclude children of parent outside of restriction',
            inputTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
            expectedTree: [{ '_A': [{ D: [{ F: [] }] }] }],
            restrictToElements: ['D'],
        },
        {
            name: 'should exclude an simple tree branch',
            inputTree: [{ A: [], B: [] }],
            expectedTree: [{ A: [] }],
            excludeElements: ['B']
        },
        {
            name: 'should exclude children on deeper levels',
            inputTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
            expectedTree: [{ A: [{ C: [], D: [] }], B: [{ E: [] }] }],
            excludeElements: ['F'],
        },
        {
            name: 'should exclude children with children',
            inputTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
            expectedTree: [{ B: [{ E: [] }] }],
            excludeElements: ['A'],
        },
        {
            name: 'should exclude all elements with excluded id',
            inputTree: [{ A: [{ C: [] }], B: [{ C: [] }] }],
            expectedTree: [{ A: [], B: [] }],
            excludeElements: ['C'],
        },
        {
            name: 'should restrict and exclude at same time',
            inputTree: [{ A: [{ C: [], D: [{ F: [] }] }], B: [{ E: [] }] }],
            expectedTree: [{ A: [{ C: [], D: [] }] }],
            restrictToElements: ['A'],
            excludeElements: ['F']
        },
    ]).forEach(testCase => {
        (testCase.focused ? fit : it)(testCase.name, () => {
            let tree: E2eElement[] = treeExpressionToE2eElement(testCase.inputTree);
            const result = restrictor(tree, testCase.excludeElements, testCase.restrictToElements);
            expect(result).toEqualE2eElementTree(treeExpressionToE2eElement(testCase.expectedTree));
        });
    });
});
