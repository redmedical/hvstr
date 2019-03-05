import { ISimpleE2EElement } from '@redmedical/hvstr-utils';
import { E2eElement } from '../../src/lib/e2e-element/e2e-element';

export type TreeExpression = { [key: string]: TreeExpression[] };

function treeExpressionToSimpleE2eElement(tree: TreeExpression[]): ISimpleE2EElement[] {
    let result: ISimpleE2EElement[] = [];
    tree.forEach( x => {
        for(let item in x) {
            result.push({
                id: item,
                type: 'DIV',
                children: treeExpressionToSimpleE2eElement(x[item])
            });
        }
    });
    return result;
}

export function treeExpressionToE2eElement(tree: TreeExpression[]): E2eElement[] {
    return treeExpressionToSimpleE2eElement(tree).map(x => new E2eElement(x));
}
