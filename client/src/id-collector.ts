import { IE2eElement, Utils } from '@redmedical/hvstr-utils';

/**
 * The IdCollector is responsible to collect and prepare the elements, from which the page-objects will be generated, in the application context.
 * It provides a api to the core part in the NodeJs context.
 *
 * __Important:__
 * You need to call the init method, before you can do anything else.
 *
 * __Hint:__
 * Use the Id collector just in development mode or in a dedicated environment mode, so it can not interfere your production.
 *
 * ## global methods
 * | signature | description |
 * |-----------|-------------|
 * |[```window.getE2eElementTree(): IE2eElement[]```](./get-e2e-element-tree.md)| Provides the elements from the IDCollector as a tree. |
 * |[```window.getE2eElementList(): IE2eElement[]```](./get-e2e-element-list.md)| Provides the elements from the IDCollector as a list. |
 *
 * @export
 * @class IdCollector
 */
export class IdCollector {
    private static allE2EIds: IE2eElement[] = [];
    private static uidCounter: number = 0;
    private static isInitialized: boolean = false;


    /**
     * Initializes the IdCollector.
     *
     * @static
     * @memberof IdCollector
     */
    public static init(): void {
        (window as any)[Utils.getE2eElementTreeFunctionName] = () => this.buildTree();
        (window as any)[Utils.getListFunctionName] = () => {
            IdCollector.removeAllParents();
            IdCollector.addParents();
            return IdCollector.allE2EIds;
        };
        IdCollector.isInitialized = true;
    }

    /**
     * Adds an element to the IdCollector.
     *
     * @static
     * @param {Element} nativeElement
     * @param {string} id
     * @memberof IdCollector
     * @returns the unique handle, which is needed to remove the item.
     */
    public static add(nativeElement: Element, id: string): string {
        if (!IdCollector.isInitialized) {
            throw `IdCollector not initialized. Run 'IdCollector.init()' first!`;
        }
        if (!id.match(Utils.isValidKebabId)) {
            throw `Id ${id} does not match pattern ${Utils.isValidKebabId.toString()}`;
        }
        const uid: string = String(IdCollector.uidCounter);
        IdCollector.uidCounter++;
        const type = nativeElement.tagName;
        nativeElement.className += ' ' + Utils.getCssClassFromKebabId(id);
        IdCollector.allE2EIds.push({ uid, id, type, nativeElement, parent: undefined, children: [] });
        IdCollector.addParentRecursiveForEachChild(nativeElement, uid);
        return uid;
    }

    /**
     * Removes a element from the IdCollector.
     *
     * @static
     * @param {string} uid The handle returned by the ```add``` method, of the element to remove.
     * @memberof IdCollector
     */
    public static remove(uid: string): void {
        if (!IdCollector.isInitialized) {
            throw `IdCollector not initialized. Run 'IdCollector.init()' first!`;
        }
        IdCollector.allE2EIds = IdCollector.allE2EIds.filter(x => x.uid !== uid);
    }

    private static addParents(): void {
        IdCollector.allE2EIds.forEach(element => {
            IdCollector.addParentRecursiveForEachChild(element.nativeElement, element.uid);
        });
        IdCollector.allE2EIds.forEach(element => {
            element.parent = element.nativeElement.getAttribute('e2e-parent') || undefined;
        });
    }

    private static buildTree(): IE2eElement[] {
        IdCollector.removeAllParents();
        IdCollector.addParents();
        const root: IE2eElement[] = [];
        IdCollector.allE2EIds.forEach(x => {
            if (x.parent) {
                const parent = IdCollector.allE2EIds.find(y => y.uid === x.parent);
                parent!.children.push(x);
            } else {
                root.push(x);
            }
        });
        return root;
    }

    private static removeAllParents(): void{
        IdCollector.allE2EIds.forEach(x => x.children = []);
    }

    private static addParentRecursiveForEachChild(nativeElement: Element, parentUid: string): void {
        for (let i = 0; i < nativeElement.children.length; i++) {
            IdCollector.addParentRecursive(nativeElement.children[i], parentUid);
        }
    }

    private static addParentRecursive(nativeElement: Element , parentUid: string): void {
        nativeElement.setAttribute('e2e-parent', parentUid);
        IdCollector.addParentRecursiveForEachChild(nativeElement, parentUid);
    }

}
