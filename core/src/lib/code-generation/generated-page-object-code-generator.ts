import { Utils } from '@redmedical/hvstr-utils';
import { E2eElement } from '../e2e-element/e2e-element';
import { QueuedCodeBuilder } from './code-builder/queued-code-builder';
import { IChildPage } from '../page-object/child-page';
import { Path } from '../local-utils/path';
import { CustomSnippets } from './custom-snippet';
import { IPageObjectBuilderOptions } from '../page-object-builder-options';
import { E2eElementTree } from '../e2e-element/e2e-element-tree';

/**
 * @private
 */
export class GeneratedPageObjectCodeGenerator {

    constructor(
        private options: IPageObjectBuilderOptions,
    ) { }

    generatePageObject(params: IGeneratePageObjectParameter): string {
        params.codeBuilder
            .reset()
            .addImport('by', 'protractor');

        this
            .addImports(params)
            .addFileInfoComment(params.codeBuilder)
            .addClass(params);
        return params.codeBuilder.getResult();
    }

    private addClass(params: IGeneratePageObjectParameter): GeneratedPageObjectCodeGenerator {
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

        this
            .addRoute(codeBuilder, params.route)
            .addEmptyLine(codeBuilder)
            .addGetterMethods(params)
            .addEmptyLine(codeBuilder)
            .addHelperMethods(params);

        codeBuilder
            .decreaseDepth()
            .addLine(`}`);

        return this;
    }

    private addRoute(codeBuilder: QueuedCodeBuilder, route: string | undefined): GeneratedPageObjectCodeGenerator {
        codeBuilder
            .addConditionalLine(``, Boolean(route))
            .addConditionalLine(`route = '${route}';`, Boolean(route))
            .addConditionalLine(``, Boolean(route));
        return this;
    }

    private addHelperMethods(params: IGeneratePageObjectParameter): GeneratedPageObjectCodeGenerator {
        this.addNavigateTo(params.codeBuilder, params.route);
        this.addFillForm(params);
        return this;
    }

    private addNavigateTo(codeBuilder: QueuedCodeBuilder, route: string | undefined): GeneratedPageObjectCodeGenerator {
        codeBuilder.addConditionalLine(`navigateTo = () => this.browser.get(this.route);`, Boolean(route));
        return this;
    }

    private addFillForm(params: IGeneratePageObjectParameter): GeneratedPageObjectCodeGenerator {
        if (params.hasFillForm) {

            const fillFormElements = params.elementTree.flatTree.filter(x => params.customSnippets.exists(x, 'fillForm'));
            const clearFormElements = params.elementTree.flatTree.filter(x => params.customSnippets.exists(x, 'clearForm'));

            params.codeBuilder
                .addLine(``)
                .addLine(`async fillForm(`)
                .increaseDepth()
                .addLine(`data: {`)
                .increaseDepth();
            fillFormElements.forEach(x => {
                params.codeBuilder.addLine(`${Utils.firstCharToLowerCase(x.pureId)}?: ${params.customSnippets.types(x)};`);
            });

            params.codeBuilder
                .decreaseDepth()
                .addLine(`},`)
                .decreaseDepth()
                .addLine(`) {`)
                .increaseDepth();
            fillFormElements.forEach(x => {
                params.customSnippets.execute(x, params.codeBuilder, this.options, 'fillForm');
            });
            params.codeBuilder
                .decreaseDepth()
                .addLine(`}`)
                .addLine(``)
                .addLine(`async clearForm() {`)
                .increaseDepth();
            clearFormElements.forEach(x => {
                params.customSnippets.execute(x, params.codeBuilder, this.options, 'clearForm');
            });
            params.codeBuilder
                .decreaseDepth()
                .addLine(`}`);
        }
        return this;
    }

    private addGetterMethods(
        params: IGeneratePageObjectParameter,
    ): GeneratedPageObjectCodeGenerator {
        params.elementTree.flatTree.forEach(x => {
            this.generateGetterMethod(params.codeBuilder, x, params.customSnippets);
        });
        return this;
    }

    private addConstructor(codeBuilder: QueuedCodeBuilder, childPageNames: string[]): GeneratedPageObjectCodeGenerator {
        codeBuilder
            .addLine(`constructor(`)
            .increaseDepth()
            .addImport('ProtractorBrowser', 'protractor')
            .addImport('browser', 'protractor', '_browser')
            .addLine(`private customBrowser?: ProtractorBrowser,`)
            .decreaseDepth()
            .addLine(`) {`)
            .increaseDepth();
        childPageNames.forEach(childPageName => {
            codeBuilder.addLine(`this.${Utils.firstCharToLowerCase(childPageName)} = new ${childPageName}(customBrowser);`);
        });
        codeBuilder
            .decreaseDepth()
            .addLine(`}`)
            .addLine(`protected get browser(): ProtractorBrowser {`)
            .increaseDepth()
            .addLine(`return this.customBrowser || _browser;`)
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

    private addImports(params: IGeneratePageObjectParameter): GeneratedPageObjectCodeGenerator {
        const codeBuilder = params.codeBuilder;
        codeBuilder.addImportStatements();
        if (!params.generatedPageObjectPath) {
            return this;
        }
        params.childPages.forEach(childPage => {
            const fromPath = params.generatedPageObjectPath!.relative(childPage.pageObject.generatedExtendingPageObjectPath.fullPath);
            codeBuilder.addImport(childPage.name, fromPath);
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
        customSnippets: CustomSnippets,
    ): GeneratedPageObjectCodeGenerator {
        codeBuilder
            .addLine(``)
            .addLine(`// ElementType: ${element.type.toUpperCase()}`);

        customSnippets.execute(element, codeBuilder, this.options, 'getterFunction');
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
interface IGeneratePageObjectParameter {
    pageName: string;
    codeBuilder: QueuedCodeBuilder;
    route?: string;
    hasFillForm: boolean;
    elementTree: E2eElementTree;
    customSnippets: CustomSnippets;
    generatedPageObjectPath?: Path;
    childPages: IChildPage[];
}
