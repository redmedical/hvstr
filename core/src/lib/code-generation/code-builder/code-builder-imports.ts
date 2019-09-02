import { IQueueStep } from './queued-code-builder/queue-step';
import { CodeBuilder } from './code-builder';

type ILibraryImport = {
    from: string;
    elements: {
        element: string;
        importAs?: string;
    }[];
};

export class CodeBuilderImports implements IQueueStep {

    private imports: ILibraryImport[] = [];

    add(element: string, from: string, importAs?: string): void {
        let importLib = this.imports.find(x => x.from === from);
        if (!importLib) {
            importLib = { from, elements: [] };
            this.imports.push(importLib);
        }
        if (importLib.elements.findIndex(x => x.element === element) === -1) {
            importLib.elements.push({ element, importAs });
        }
    }
    execute(codeBuilder: CodeBuilder): void {
        this.imports.forEach(_import => {
            const elements = _import.elements.map(x =>
                x.importAs ? `${x.element} as ${x.importAs}` : x.element
            ).join(', ');
            codeBuilder.addLine(`import { ${elements} } from '${_import.from}';`);
        });
    }
    clear(): void {
        this.imports = [];
    }
}
