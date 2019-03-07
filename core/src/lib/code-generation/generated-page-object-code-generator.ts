import { Utils } from '@redmedical/hvstr-utils';
import { E2eElement } from '../e2e-element/e2e-element';
import { QueuedCodeBuilder } from './code-builder/queued-code-builder';
import { IChildPage } from '../page-object/child-page';
import { Path } from '../local-utils/path';
import { CustomSnippets } from './element-function-custom-snippet';

/**
 * @private
 */
export class GeneratedPageObjectCodeGenerator {
    generatePageObject(params: IGeneratePageObjectRootParameter): string {
        params.codeBuilder.reset();
        const protractorImports: string[] = ['by', 'element'];
        const inputFields: E2eElement[] = [];
        this
            .addImports(protractorImports, params)
            .addFileInfoComment(params.codeBuilder)
            .addClass(protractorImports, inputFields, params);
        return params.codeBuilder.getResult();
    }

    private addClass(protractorImports: string[], inputFields: E2eElement[], params:IGeneratePageObjectRootParameter): GeneratedPageObjectCodeGenerator {
        const codeBuilder = params.codeBuilder;
        const childPageNames: string[] = params.childPages.map(x => x.name);

        codeBuilder
            .addLine(``)
            .addLine(`export class Generated${params.pageName} {`)
            .increaseDepth();

        this
            .addPublicMembers(childPageNames, codeBuilder)
            .addEmptyLine(codeBuilder)
            .addConstructor(codeBuilder, childPageNames);

        if (Boolean(params.route)) {
            protractorImports.push('browser');
        }

        this
            .addRoute(codeBuilder, params.route)
            .addEmptyLine(codeBuilder)
            .addGetterMethods(inputFields, protractorImports, params)
            .addEmptyLine(codeBuilder)
            .addHelperMethods(inputFields, params);

        codeBuilder
            .decreaseDepth()
            .addLine(`}`);

        return this;
    }

    private addRoute(codeBuilder: QueuedCodeBuilder, route: string | undefined): GeneratedPageObjectCodeGenerator  {
        codeBuilder
            .addLineCondition(``, Boolean(route))
            .addLineCondition(`route = '${route}';`, Boolean(route))
            .addLineCondition(``, Boolean(route));
        return this;
    }

    private addHelperMethods(inputFields: E2eElement[], params: IGeneratePageObjectAddHelperMethodsParameter): GeneratedPageObjectCodeGenerator {
        this.addNavigateTo(params.codeBuilder, params.route);
        this.addFillForm(params.hasFillForm, inputFields, params.codeBuilder);
        return this;
    }

    private addNavigateTo(codeBuilder: QueuedCodeBuilder, route: string | undefined): GeneratedPageObjectCodeGenerator {
        codeBuilder.addLineCondition(`navigateTo = () => browser.get(this.route);`, Boolean(route));
        return this;
    }

    private addFillForm(fillForm: boolean, inputFields: E2eElement[], codeBuilder: QueuedCodeBuilder): GeneratedPageObjectCodeGenerator {
        if (fillForm && inputFields.length > 0) {
            codeBuilder
                .addLine(``)
                .addLine(`async fillForm(`)
                .increaseDepth()
                .addLine(`data: {`)
                .increaseDepth();
            inputFields.forEach(x => {
                codeBuilder.addLine(`${Utils.firstCharToLowerCase(x.id)}: string;`);
            });
            codeBuilder
                .decreaseDepth()
                .addLine(`},`)
                .decreaseDepth()
                .addLine(`) {`)
                .increaseDepth();
            inputFields.forEach(x => {
                codeBuilder.addLine(`await this.get${x.id}().sendKeys(data.${Utils.firstCharToLowerCase(x.id)});`);
            });
            codeBuilder
                .decreaseDepth()
                .addLine(`}`)
                .addLine(``)
                .addLine(`async clearForm() {`)
                .increaseDepth();
            inputFields.forEach(x => {
                codeBuilder.addLine(`await this.get${x.id}().clear();`);
            });
            codeBuilder
                .decreaseDepth()
                .addLine(`}`);
        }
        return this;
    }

    private addGetterMethods(
        inputFields: E2eElement[],
        protractorImports: string[],
        params: IGeneratePageObjectAddGetterMethodsParameter
    ): GeneratedPageObjectCodeGenerator {
        params.elementTreeRoot.forEach(x => {
            this.generateGetterMethod(params.codeBuilder, x, inputFields, protractorImports, params.rules);
        });
        return this;
    }

    private addConstructor(codeBuilder: QueuedCodeBuilder, childPageNames: string[]): GeneratedPageObjectCodeGenerator {
        if (childPageNames.length === 0) {
            return this;
        }
        codeBuilder
            .addLine(`constructor() {`)
            .increaseDepth();
        childPageNames.forEach(childPageName => {
            codeBuilder.addLine(`this.${Utils.firstCharToLowerCase(childPageName)} = new ${childPageName}();`);
        });
        codeBuilder
            .decreaseDepth()
            .addLine(`}`);
        return this;
    }

    private addPublicMembers(childPageNames: string[], codeBuilder: QueuedCodeBuilder): GeneratedPageObjectCodeGenerator {
        childPageNames.forEach(childPageName => {
            codeBuilder.addLine(`public ${Utils.firstCharToLowerCase(childPageName)}: ${childPageName};`);
        });
        return this;
    }

    private addImports(protractorImports: string[], params: IGeneratePageObjectAddImportsParameter): GeneratedPageObjectCodeGenerator {
        const codeBuilder = params.codeBuilder;
        codeBuilder.addDynamicLine(() => `import { ${protractorImports.join(', ')} } from 'protractor';`);
        if(!params.generatedPageObjectPath) {
            return this;
        }
        params.childPages.forEach(childPage => {
            codeBuilder.addLine(
                `import { ${childPage.name} } from '${
                    params.generatedPageObjectPath!.relative(childPage.pageObject.generatedExtendingPageObjectPath.fullPath)
                }';`
            );
        });
        return this;
    }

    private addFileInfoComment(codeBuilder: QueuedCodeBuilder): GeneratedPageObjectCodeGenerator {
        codeBuilder
            .addLine(`/**`)
            .addLine(` * This Page Object was generated automatically.`)
            .addLine(` * Do not change this file, changes may be overwritten.`)
            .addLine(` * If you want to extend the functionality of this Page object use the extending page-objects in the parent folder.`)
            .addLine(` */`);
        return this;
    }

    private generateGetterMethod(
        codeBuilder: QueuedCodeBuilder,
        element: E2eElement,
        inputFields: E2eElement[],
        protractorImports: string[],
        rules: CustomSnippets,
    ): GeneratedPageObjectCodeGenerator {
        codeBuilder
            .addLine(``)
            .addLine(`// ElementType: ${element.type.toUpperCase()}`);


        rules.execute(element, codeBuilder, protractorImports);

        if (element.type.toUpperCase() === 'INPUT') {
            inputFields.push(element);
        }
        element.children.forEach(x => {
            this.generateGetterMethod(codeBuilder, x, inputFields, protractorImports, rules);
        });
        return this;
    }

    private addEmptyLine(codeBuilder: QueuedCodeBuilder): GeneratedPageObjectCodeGenerator {
        codeBuilder.addLine('');
        return this;
    }
}

/**
 * @private
 */
interface IGeneratePageObjectRootParameter extends
    IGeneratePageObjectAddHelperMethodsParameter,
    IGeneratePageObjectAddGetterMethodsParameter,
    IGeneratePageObjectAddImportsParameter {
    pageName: string;
}

/**
 * @private
 */
interface IGeneratePageObjectParameter{
    codeBuilder: QueuedCodeBuilder;
}

/**
 * @private
 */
interface IGeneratePageObjectAddHelperMethodsParameter extends IGeneratePageObjectParameter {
    codeBuilder: QueuedCodeBuilder;
    route?: string;
    hasFillForm: boolean;
}

/**
 * @private
 */
interface IGeneratePageObjectAddGetterMethodsParameter extends IGeneratePageObjectParameter {
    codeBuilder: QueuedCodeBuilder;
    elementTreeRoot: E2eElement[];
    rules: CustomSnippets;
}

/**
 * @private
 */
interface IGeneratePageObjectAddImportsParameter extends IGeneratePageObjectParameter {
    codeBuilder: QueuedCodeBuilder;
    generatedPageObjectPath?: Path;
    childPages: IChildPage[];
}
