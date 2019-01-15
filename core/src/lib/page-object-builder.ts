import { IGenerationInstruction } from './local-utils/generation-instruction';
import { browser, ExpectedConditions, element, by } from 'protractor';
import * as fs from 'fs';
import { BrowserApi } from './local-utils/browser-api';
import { GeneratedPageObjectCodeGenerator } from './code-generation/generated-page-object-code-generator';
import { QueuedCodeBuilder } from './code-generation/code-builder/queued-code-builder';
import { ProjectPathUtil, Path } from './local-utils/path';
import { ExtendingPageObjectCodeGenerator } from './code-generation/extending-page-object-code-generator';
import { E2eElement } from './e2e-element/e2e-element';
import { elementTreeMerge } from './e2e-element/element-tree-merge';
import { IPageObjectInFabrication } from './page-object/page-object-in-fabrication';
import { compilePageObject, requirePageObject } from './page-object/page-object-loader';
import { ConflictResolver } from './conflict-resolver/conflict-resolver';
import { mergeDuplicateArrayElements } from './conflict-resolver/array-duplicate-merge';
import { IChildPage } from './page-object/child-page';
import { Awaiter } from './local-utils/types';
import { initCustomSnippet, CustomSnippets } from './code-generation/element-function-custom-snippet';

export class PageObjectBuilder {
    public customSnippets: CustomSnippets;
    public codeBuilder: QueuedCodeBuilder;
    public waitForAngularEnabled: boolean;
    packagePath: ProjectPathUtil;
    public awaiter: Awaiter;

    constructor(
        params: {
            codeBuilder?: QueuedCodeBuilder,
            awaiter?: Awaiter,
            e2eTestPath?: string,
            waitForAngularEnabled?: boolean,
        }
    ) {
        this.codeBuilder = params.codeBuilder || new QueuedCodeBuilder('  ');
        this.awaiter = params.awaiter || (async () => {});
        this.waitForAngularEnabled = params.waitForAngularEnabled === undefined ? true : params.waitForAngularEnabled;
        this.packagePath = new ProjectPathUtil(process.cwd(), params.e2eTestPath || '/e2e');
        this.packagePath.createAllDirectories();
        this.customSnippets = initCustomSnippet();
        browser.waitForAngularEnabled(this.waitForAngularEnabled);
    }

    public async generate(instruct: IGenerationInstruction, origin?: IPageObjectInFabrication): Promise<IPageObjectInFabrication> {
        if (!instruct.name) {
            throw 'a new page object needs an name!';
        }
        await this.executeByPreparer(instruct, origin);
        const newTree: E2eElement[] = (await BrowserApi.getE2eElementTree()).map(x => new E2eElement(x));
        const e2eElementTree: E2eElement[] = elementTreeMerge(
            [],
            newTree,
            instruct.excludeElements || [],
            false,
            instruct.restrictToElements
        );
        mergeDuplicateArrayElements(e2eElementTree);
        ConflictResolver(e2eElementTree);
        return await this.openAndGeneratePageObject({
            instruct,
            pageObjectName: instruct.name!,
            instructPath: instruct.path,
            e2eElementTree,
            childPages: [],
            origin,
            hasFillForm: false
        });
    }

    public async append(instruct: IGenerationInstruction, scope: IPageObjectInFabrication): Promise<IPageObjectInFabrication> {
        if(!instruct.path && scope.instruct.path) {
            // Append should not change Path on default
            instruct.path = scope.instruct.path;
        }
        await this.executeByPreparer(instruct, scope);
        const newTree: E2eElement[] = (await BrowserApi.getE2eElementTree()).map(x => new E2eElement(x))
        const e2eElementTree: E2eElement[] = elementTreeMerge(
            scope.e2eElementTree,
            newTree,
            instruct.excludeElements || [],
            false,
            instruct.restrictToElements
        );
        mergeDuplicateArrayElements(e2eElementTree);
        ConflictResolver(e2eElementTree);
        const newLocal =
            await this.openAndGeneratePageObject({
                instruct,
                pageObjectName: scope.name,
                instructPath: scope.instruct.path,
                e2eElementTree: e2eElementTree,
                childPages: scope.childPages,
                origin: scope,
                route: scope.route,
                hasFillForm: scope.hasFillForm
            });
        return newLocal;
    }

    public async appendChild(instruct: IGenerationInstruction, scope: IPageObjectInFabrication): Promise<IPageObjectInFabrication> {
        if (!instruct.name) {
            throw 'a new page object needs an name!';
        }
        const child: IPageObjectInFabrication = await this.generate(instruct, scope);
        const childPages: IChildPage[] = [...scope.childPages, {name: instruct.name, pageObject: child}];
        const parent =
            await this.openAndGeneratePageObject({
                instruct: this.getEmptyInstructFromOrigin(scope.instruct),
                pageObjectName: scope.name,
                instructPath: scope.instruct.path,
                e2eElementTree: scope.e2eElementTree,
                childPages,
                origin: scope,
                newChild: child,
                route: scope.route,
                hasFillForm: scope.hasFillForm
            });
        return parent;
    }

    public async addNavigateTo(scope: IPageObjectInFabrication): Promise<IPageObjectInFabrication> {
        const route: string = await BrowserApi.getRoute();
        const parent =
            await this.openAndGeneratePageObject({
                instruct: this.getEmptyInstructFromOrigin(scope.instruct),
                pageObjectName: scope.name,
                instructPath: scope.instruct.path,
                e2eElementTree: scope.e2eElementTree,
                childPages: scope.childPages,
                origin: scope,
                route,
                hasFillForm: scope.hasFillForm
            });
        return parent;
    }

    public async addFillForm(scope: IPageObjectInFabrication): Promise<IPageObjectInFabrication> {
        const parent =
            await this.openAndGeneratePageObject({
                instruct: this.getEmptyInstructFromOrigin(scope.instruct),
                pageObjectName: scope.name,
                instructPath: scope.instruct.path,
                e2eElementTree: scope.e2eElementTree,
                childPages: scope.childPages,
                origin: scope,
                route: scope.route,
                hasFillForm: true
            });
        return parent;
    }


    private async executeByPreparer(instruct: IGenerationInstruction, origin: IPageObjectInFabrication | undefined): Promise<void> {
        const awaiter: Awaiter = instruct.awaiter || this.awaiter;
        if (instruct.from) {
            await this.executeByPreparer(instruct.from.instruct, instruct.from.origin);
        } else if (origin) {
            await this.executeByPreparer(origin.instruct, origin.origin);
        }
        if (instruct.byRoute) {
            await browser.get(instruct.byRoute);
            // After the redirect, the script continues while the browser is still loading.
            // it looks like waitForAngular resolves the promise immediately, because no Angular app
            await BrowserApi.awaitDocumentToBeReady();
            await browser.sleep(2000);
            if(this.waitForAngularEnabled){
                await browser.waitForAngular();
            }
        }
        await awaiter(1);
        if (instruct.byAction) {
            instruct.byAction();
        }
        else if (instruct.byActionAsync) {
            await instruct.byActionAsync();
        }
        await awaiter(2);
    }

    private async openAndGeneratePageObject(params: IOpenAndGeneratePageObjectInstruct): Promise<IPageObjectInFabrication> {
        const generateGeneratedPageObject: GeneratedPageObjectCodeGenerator = new GeneratedPageObjectCodeGenerator();
        const generateExtendingPageObject: ExtendingPageObjectCodeGenerator = new ExtendingPageObjectCodeGenerator();

        const generatedPageObjectPath: Path = this.packagePath.getFilePath(params.pageObjectName, params.instructPath, false);
        const generatedExtendingPageObjectPath: Path = this.packagePath.getFilePath(params.pageObjectName, params.instructPath, true);

        const generatedPageObject: string =
            generateGeneratedPageObject.generatePageObject({
                pageName: params.pageObjectName,
                generatedPageObjectPath,
                elementTreeRoot: params.e2eElementTree,
                childPages: params.childPages,
                codeBuilder: this.codeBuilder!,
                route: params.route,
                hasFillForm: params.hasFillForm,
                rules: this.customSnippets,
            });
        if(!params.instruct.virtual) {
            this.writePageObject(generatedPageObject, generatedPageObjectPath);
        }

        if(!generatedExtendingPageObjectPath.exists) {
            const generatedExtendingPageObject: string =
                generateExtendingPageObject.generatePageObject(
                    params.pageObjectName,
                    this.codeBuilder!,
                    generatedExtendingPageObjectPath,
                    generatedPageObjectPath
                );
            if(!params.instruct.virtual) {
                this.writePageObject(generatedExtendingPageObject, generatedExtendingPageObjectPath);
            }
        }

        const generatedPageObjectWithoutChildren: string =
            generateGeneratedPageObject.generatePageObject({
                pageName: params.pageObjectName,
                elementTreeRoot: params.e2eElementTree,
                childPages: [],
                codeBuilder: this.codeBuilder!,
                route: params.route,
                hasFillForm: params.hasFillForm,
                rules: this.customSnippets,
            });
        const jsCode = compilePageObject(generatedPageObjectWithoutChildren);

        return requirePageObject({
            pageObjectBuilder: this,
            instruct: params.instruct,
            origin: params.origin,
            newChild: params.newChild,
            pageObjectName: params.pageObjectName,
            e2eElementTree: params.e2eElementTree,
            childPages: params.childPages,
            generatedPageObjectPath,
            generatedExtendingPageObjectPath,
            hasFillForm: params.hasFillForm,
            jsCode: jsCode,
        });
    }

    private writePageObject(code: string, path: Path, overwrite: boolean = true): void {
        path.mkdirp();
        if (overwrite || !fs.existsSync(path.fullName)) {
            fs.writeFileSync(path.fullName, code);
        }
    }

    private getEmptyInstructFromOrigin(instruct: IGenerationInstruction): IGenerationInstruction {
        return {
            name: instruct.name,
            virtual: instruct.virtual,
            excludeElements: instruct.excludeElements,
            path: instruct.path,
        }
    }
}

interface IOpenAndGeneratePageObjectInstruct {
    instruct: IGenerationInstruction;
    pageObjectName: string;
    instructPath?: string;
    e2eElementTree: E2eElement[];
    childPages: IChildPage[];
    origin?: IPageObjectInFabrication;
    newChild?: IPageObjectInFabrication;
    route?: string;
    hasFillForm: boolean;
}
