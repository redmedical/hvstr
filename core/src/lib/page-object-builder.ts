import { IGenerationInstruction } from './local-utils/generation-instruction';
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

/**
 * Contains all important interfaces to generate page-objects.
 *
 * @export
 * @class PageObjectBuilder
 * @module HVSTRCorePublicApi
 */
export class PageObjectBuilder {
    /**
     * See CustomSnippets.
     *
     * @type {CustomSnippets}
     * @memberof PageObjectBuilder
     */
    public customSnippets: CustomSnippets;
    /**
     * The codebuilder passed in the constructor or the default codebuilder
     *
     * @type {QueuedCodeBuilder}
     * @memberof PageObjectBuilder
     */
    public codeBuilder: QueuedCodeBuilder;
    /**
     * In constructor defined, if waitForAngular should be enabled or not
     *
     * @type {boolean}
     * @memberof PageObjectBuilder
     */
    public waitForAngularEnabled: boolean;
    packagePath: ProjectPathUtil;
    /**
     * In constructor defined awaiter
     *
     * @type {Awaiter}
     * @memberof PageObjectBuilder
     */
    public awaiter: Awaiter;

    /**
     * Creates an instance of PageObjectBuilder.
     * @param {{
     *             codeBuilder?: QueuedCodeBuilder,
     *             awaiter?: Awaiter,
     *             e2eTestPath?: string,
     *             waitForAngularEnabled?: boolean,
     *         }} params
     * @memberof PageObjectBuilder
     */
    constructor(
        params: {
            /**
             * Defines the CodeBuilder. See more at QueuedCodeBuilder
             *
             * @type {QueuedCodeBuilder}
             * @default new QueuedCodeBuilder('  ')
             */
            codeBuilder?: QueuedCodeBuilder,
            /**
             * Action that should be performed normally. See more at IGenerationInstruct
             *
             * @type {Awaiter}
             * @default () => {}
             */
            awaiter?: Awaiter,
            /**
             * Defines the root-path, where the page-objects should be stored
             *
             * @type {string}
             * @default '/e2e'
             */
            e2eTestPath?: string,
            /**
             * Defines if the protractor-setting WaitForAngular should be enabled or disabled.
             *
             * @type {boolean}
             * @default true
             */
            waitForAngularEnabled?: boolean,
            /**
             * Forbid HVSTR to create default page object directory's.
             *
             * @type {boolean}
             */
            doNotCreateDirectorys?: boolean,
        }
    ) {
        this.codeBuilder = params.codeBuilder || new QueuedCodeBuilder('  ');
        this.awaiter = params.awaiter || (async () => {});
        this.waitForAngularEnabled = params.waitForAngularEnabled === undefined ? true : params.waitForAngularEnabled;
        this.packagePath = new ProjectPathUtil(process.cwd(), params.e2eTestPath || '/e2e');
        if (!params.doNotCreateDirectorys) {
            this.packagePath.createAllDirectories();
        }
        this.customSnippets = initCustomSnippet();
        BrowserApi.setWaitForAngularEnabled(this.waitForAngularEnabled);
    }

    /**
     * Generates a new page-object.
     *
     * @param {IGenerationInstruction} instruct The Instruct parameter passes an object, which defines how the page-object should be generated.
     * See more at IGenerationInstruction. The entity name is mandatory.
     * @param {IPageObjectInFabrication} [origin] The origin parameter describes, from which page-object the new page-object derived from.
     * The parameter is optional and is used primary internal.
     * @returns {Promise<IPageObjectInFabrication>} the async method returns a Promise of IPageObjectInFabrication.
     * See IPageObjectInFabrication for detailed information.
     * @memberof PageObjectBuilder
     * @throws When no name for the page-object, was contained in the passed instruct, an Error will be thrown.
     */
    public async generate(instruct: IGenerationInstruction, origin?: IPageObjectInFabrication): Promise<IPageObjectInFabrication> {
        if (!instruct.name) {
            throw new Error('a new page object needs an name!');
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

    /**
     * Appends new elements to an existing page-object.
     *
     * @param {IGenerationInstruction} instruct The Instruct parameter passes an object, which defines how the page-object should be generated.
     * See more at [IGenerationInstruction](../i-generation-instruction/index.md).
     * @param {IPageObjectInFabrication} scope The original page-object, which the new elements will be merged to.
     * @returns {Promise<IPageObjectInFabrication>} the async method returns a ```Promise``` of ```IPageObjectInFabrication```.
     * See [```IPageObjectInFabrication```]() for detailed information.
     * @memberof PageObjectBuilder
     */
    public async append(instruct: IGenerationInstruction, scope: IPageObjectInFabrication): Promise<IPageObjectInFabrication> {
        if(!instruct.path && scope.instruct.path) {
            // Append should not change Path on default
            instruct.path = scope.instruct.path;
        }
        await this.executeByPreparer(instruct, scope);
        const newTree: E2eElement[] = (await BrowserApi.getE2eElementTree()).map(x => new E2eElement(x));
        const e2eElementTree: E2eElement[] = elementTreeMerge(
            scope.e2eElementTree,
            newTree,
            instruct.excludeElements || [],
            false,
            instruct.restrictToElements
        );
        mergeDuplicateArrayElements(e2eElementTree);
        ConflictResolver(e2eElementTree);
        return await this.openAndGeneratePageObject({
            instruct,
            pageObjectName: scope.name,
            instructPath: scope.instruct.path,
            e2eElementTree: e2eElementTree,
            childPages: scope.childPages,
            origin: scope,
            route: scope.route,
            hasFillForm: scope.hasFillForm
        });
    }

    /**
     * Appends a page-object as child object to a parent page-object.
     * The child-page-object will be composited as a entity to the parent page-object.
     * When a new instance of the parent page-object is created, all child page-objects will be instantiated to.
     *
     * @param {IGenerationInstruction} instruct The Instruct parameter passes an object, which defines how the page-object should be generated.
     * See more at [IGenerationInstruction](../i-generation-instruction/index.md).
     * @param {IPageObjectInFabrication} scope The original page-object, which the new child page-object will added to.
     * @returns {Promise<IPageObjectInFabrication>} the async method returns a ```Promise``` of ```IPageObjectInFabrication```.
     * The returned page-object is the parent page-object, containing the new child page-object.
     * See [```IPageObjectInFabrication```]() for detailed information.
     * @memberof PageObjectBuilder
     */
    public async appendChild(instruct: IGenerationInstruction, scope: IPageObjectInFabrication): Promise<IPageObjectInFabrication> {
        if (!instruct.name) {
            throw new Error('a new page object needs an name!');
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

    /**
     * Adds a navigateTo function and a entity route to the page-object.
     * The route entity is of type string and contains the route at the active browser state. The navigateTo method lets you navigate to the route.
     *
     * @param {IPageObjectInFabrication} scope The original page-object, which the navigateTo method and route entity will be added to.
     * @returns {Promise<IPageObjectInFabrication>} the async method returns a ```Promise``` of ```IPageObjectInFabrication```.
     * See [```IPageObjectInFabrication```]() for detailed information.
     * @memberof PageObjectBuilder
     */
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

    // tslint:disable:max-line-length
    /**
     * Adds two methods to the page-object, fillForm and clearForm.
     * For each input element found on the page, the two methods will provide the following functionality.
     *
     * | function | description |
     * |----------|-------------|
     * | fillForm(data) | The fillForm method will fill out any input element with the provided data. The data is provided by the data attribute, which requires a customized interface, according to all found inputs. Each inputs id will be a parameter for the function, in camelCase. |
     * | clearForm() | clears all content from all inputs.|
     *
     * @param {IPageObjectInFabrication} scope The original page-object, which the fillForm and clearForm method will be added to.
     * @returns {Promise<IPageObjectInFabrication>} the async method returns a Promise of IPageObjectInFabrication.
     * See IPageObjectInFabrication for detailed information.
     * @memberof PageObjectBuilder
     */
    // tslint:enable:max-line-length
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

    /**
     * should not be used, is not declared as private in code, for testing capability.
     * @private
     */
    async executeByPreparer(instruct: IGenerationInstruction, origin: IPageObjectInFabrication | undefined): Promise<void> {
        const awaiter: Awaiter = instruct.awaiter || this.awaiter;
        if (instruct.from) {
            await this.executeByPreparer(instruct.from.instruct, instruct.from.origin);
        } else if (origin) {
            await this.executeByPreparer(origin.instruct, origin.origin);
        }
        if (instruct.byRoute) {
            await BrowserApi.navigate(instruct.byRoute);
            // After the redirect, the script continues while the browser is still loading.
            // it looks like waitForAngular resolves the promise immediately, because no Angular app
            await BrowserApi.awaitDocumentToBeReady();
            await BrowserApi.sleep(2000);
            if (this.waitForAngularEnabled){
                await BrowserApi.waitForAngular();
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

    /**
     * should not be used, is not declared as private in code, for testing capability.
     * @private
     */
    async openAndGeneratePageObject(params: IOpenAndGeneratePageObjectInstruct): Promise<IPageObjectInFabrication> {
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
        if (!params.instruct.virtual) {
            this.writePageObject(generatedPageObject, generatedPageObjectPath);
        }

        if (!generatedExtendingPageObjectPath.exists) {
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

    /**
     * should not be used, is not declared as private in code, for testing capability.
     * @private
     */
    writePageObject(code: string, path: Path, overwrite: boolean = true): void {
        path.mkdirp();
        if (overwrite || !fs.existsSync(path.fullName)) {
            fs.writeFileSync(path.fullName, code);
        }
    }

    /**
     * should not be used, is not declared as private in code, for testing capability.
     * @private
     */
    getEmptyInstructFromOrigin(instruct: IGenerationInstruction): IGenerationInstruction {
        return {
            name: instruct.name,
            virtual: instruct.virtual,
            excludeElements: instruct.excludeElements,
            path: instruct.path,
        };
    }
}

/**
 * @private
 */
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
