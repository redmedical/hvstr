import { IE2eElement, Utils } from '@redmedical/HVSTR-utils';

export class IdCollector {
    private static allE2EIds: IE2eElement[] = [];
    private static uidCounter: number = 0;
    private static isInitialized: boolean = false;
    public static init(): void {
        (window as any)[Utils.getE2eElementTreeFunctionName] = () => this.buildTree();
        (window as any)[Utils.getListFunctionName] = () => {
            IdCollector.removeAllParents();
            IdCollector.addParents();
            return IdCollector.allE2EIds;
        };
        IdCollector.isInitialized = true;
    }

    public static add(nativeElement: Element, id: string): void {
        if (!IdCollector.isInitialized) {
            throw `IdCollector not initialized. Run 'IdCollector.init()' first!`;
        }
        if (!id.match(Utils.isValidKebabId)) {
            throw `Id ${id} does not match pattern ${Utils.isValidKebabId.toString()}`
        }
        const type = nativeElement.tagName;
        nativeElement.className += ' ' + Utils.getCssClassFromKebabId(id);
        IdCollector.allE2EIds.push({ uid: String(IdCollector.uidCounter), id, type, nativeElement, parent: undefined, children: [] });
        IdCollector.addParentRecursiveForEachChild(nativeElement, String(IdCollector.uidCounter));
        IdCollector.uidCounter++;
    }

    public static remove(id: string): void {
        if (!IdCollector.isInitialized) {
            throw `IdCollector not initialized. Run 'IdCollector.init()' first!`;
        }
        IdCollector.allE2EIds = IdCollector.allE2EIds.filter(x => x.id !== id);
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
