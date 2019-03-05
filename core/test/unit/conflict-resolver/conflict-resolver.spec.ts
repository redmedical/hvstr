import { E2eElement } from '../../../src/lib/e2e-element/e2e-element';
import { TreeExpression, treeExpressionToE2eElement } from '../../utils/e2eElementTreeExpression';
import { ConflictResolver } from '../../../src/lib/conflict-resolver/conflict-resolver';

interface testCase {
    name: string;
    inputTree: TreeExpression[];
    expectedTree: TreeExpression[];
}

describe('ConflictResolver', () => {
    (<testCase[]>[
        {
            name: 'should not throw any error',
            inputTree: [],
            expectedTree: [],
        },
        {
            name: 'not change tree for simple object',
            inputTree: [{ A: [] }],
            expectedTree: [{ A: [] }],
        },
        {
            name: 'create conflict free id\'s for simple name-conflict' ,
            inputTree: [{ A: [{ C: [] }] }, { B: [{ C: [] }] }],
            expectedTree: [{ A: [{ AC: [] }] }, { B: [{ BC: [] }] }],
        },
    ]).forEach(testCase => {
        it(testCase.name, () => {
            let tree: E2eElement[] = treeExpressionToE2eElement(testCase.inputTree);
            ConflictResolver(tree);
            expect(tree).toEqualE2eElementTree(treeExpressionToE2eElement(testCase.expectedTree));
        });
    });
});
