import { QueuedCodeBuilder } from './code-builder/queued-code-builder';
import { Path } from '../local-utils/path';

export class ExtendingPageObjectCodeGenerator {
    generatePageObject(pageName: string, codeBuilder: QueuedCodeBuilder, path: Path, pathToGeneratedFile: Path): string {
        return codeBuilder
            .reset()
            .addLine(`import { Generated${pageName} } from '${path.relative(pathToGeneratedFile.fullPath)}';`)
            .addLine(`export class ${pageName} extends Generated${pageName} {`)
            .addLine(`}`)
            .getResult();
    }
}
