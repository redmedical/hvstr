import { IGenerationInstruction } from './local-utils/generation-instruction';
import * as fs from 'fs';
import { BrowserApi } from './local-utils/browser-api';
import { GeneratedPageObjectCodeGenerator } from './code-generation/generated-page-object-code-generator';
import { QueuedCodeBuilder } from './code-generation/code-builder/queued-code-builder';
import { ProjectPathUtil, Path } from './local-utils/path';
import { ExtendingPageObjectCodeGenerator } from './code-generation/extending-page-object-code-generator';
import { E2eElement } from './e2e-element/e2e-element';
import { IPageObjectInFabrication } from './page-object/page-object-in-fabrication';
import { compilePageObject, requirePageObject } from './page-object/page-object-loader';
import { IChildPage } from './page-object/child-page';
import { Awaiter } from './local-utils/types';
import { initCustomSnippet, CustomSnippets } from './code-generation/element-function-custom-snippet';
import { E2eElementTree } from './e2e-element/e2e-element-tree';
import { IPageObjectBuilderOptions, IPageObjectBuilderInputOptions } from './page-object-builder-options';
import { defaults } from 'lodash';
import { DefaultLogger } from './local-utils/logger';

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
    packagePath: ProjectPathUtil;

    historyUidCounter: number;

    private options: IPageObjectBuilderOptions = {
        codeBuilder: new QueuedCodeBuilder('  '),
        awaiter: (async () => { }),
        waitForAngularEnabled: true,
        e2eTestPath:  '/e2e',
        doNotCreateDirectories: false,
        enableCustomBrowser: false,
        logger: new DefaultLogger(),
        pageLoadTimeOut: 0,
    };

    /**
     * Creates an instance of PageObjectBuilder.
     * @param {IPageObjectBuilderOptions} options
     * @memberof PageObjectBuilder
     */
    constructor(
        options: IPageObjectBuilderInputOptions,
    ) {
        this.options = defaults({ ...options }, this.options);
        this.options.logger = defaults({ ...this.options.logger }, new DefaultLogger());
        this.packagePath = new ProjectPathUtil(process.cwd(), this.options.e2eTestPath!);
        if (!this.options.doNotCreateDirectories) {
            this.packagePath.createAllDirectories();
        }
        this.customSnippets = initCustomSnippet();
        BrowserApi.setWaitForAngularEnabled(this.options.waitForAngularEnabled);
        this.historyUidCounter = -1;
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
            const error = new Error('a new page object needs an name!');
            this.options.logger.error(error);
            throw error;
        }
        await this.executeByPreparer(instruct, origin);
        this.historyUidCounter++;

        const newTree: E2eElementTree = new E2eElementTree(await BrowserApi.getE2eElementTree())
            .restrict(instruct.excludeElements, instruct.restrictToElements)
            .mergeDuplicateArrayElements()
            .resolveConflicts();
        const result = await this.openAndGeneratePageObject({
            instruct,
            pageObjectName: instruct.name!,
            instructPath: instruct.path,
            e2eElementTree: newTree.tree,
            childPages: [],
            origin,
            hasFillForm: false
        });
        this.options.logger.logSuccess(`✓  [generate]\t\t${instruct.name}`);
        this.options.logger.debug('generate for instruct:', instruct, 'result:', result);
        return result;
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
        if (!instruct.path && scope.instruct.path) {
            // Append should not change Path on default
            instruct.path = scope.instruct.path;
        }
        await this.executeByPreparer(instruct, scope);
        this.historyUidCounter++;

        const newTree: E2eElementTree = new E2eElementTree(await BrowserApi.getE2eElementTree())
            .restrict(instruct.excludeElements, instruct.restrictToElements)
            .mergeTo(scope.e2eElementTree)
            .mergeDuplicateArrayElements()
            .resolveConflicts();
        const result = await this.openAndGeneratePageObject({
            instruct,
            pageObjectName: scope.name,
            instructPath: scope.instruct.path,
            e2eElementTree: newTree.tree,
            childPages: scope.childPages,
            origin: scope,
            route: scope.route,
            hasFillForm: scope.hasFillForm
        });
        this.options.logger.logSuccess(`✓  [append]\t\tto ${scope.name}`);
        this.options.logger.debug('append to ' + scope + ' for instruct:', instruct, 'result:', result);
        return result;
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
        const childPages: IChildPage[] = [...scope.childPages, { name: instruct.name, pageObject: child }];
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
        this.options.logger.logSuccess(`✓  [appendChild]\t${instruct.name} to ${scope.name}`);
        this.options.logger.debug('append Child to ' + parent + ' for instruct:', instruct, 'result:', child);
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
        this.options.logger.logSuccess(`✓  [addNavigateTo]\tto ${scope.name}`);
        this.options.logger.debug('added NavigateTo result:', parent);
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
        this.options.logger.logSuccess(`✓  [addFillForm]\tto ${scope.name}`);
        this.options.logger.debug('added FillForm result:', parent);
        return parent;
    }

    /**
     * should not be used, is not declared as private in code, for testing capability.
     * @private
     */
    async executeByPreparer(instruct: IGenerationInstruction, origin: IPageObjectInFabrication | undefined): Promise<void> {
        this.options.logger.debug('executeByPreparer for instruct', instruct, 'with origin:', origin);
        const awaiter: Awaiter = instruct.awaiter || this.options.awaiter;
        if (instruct.from) {
            this.options.logger.debug('instruct has from entity with history step ', instruct.from.historyUid);
            if (instruct.from.historyUid !== this.historyUidCounter) {
                await this.executeByPreparer(instruct.from.instruct, instruct.from.origin);
            }
        } else if (origin) {
            this.options.logger.debug('instruct has origin with history step ', origin.historyUid);
            if (origin.historyUid !== this.historyUidCounter) {
                await this.executeByPreparer(origin.instruct, origin.origin);
            }
        }
        if (instruct.byRoute) {
            await BrowserApi.navigate(instruct.byRoute);
            // After the redirect, the script continues while the browser is still loading.
            // it looks like waitForAngular resolves the promise immediately, because no Angular app
            await BrowserApi.awaitDocumentToBeReady();
            if (this.options.waitForAngularEnabled) {
                await BrowserApi.waitForAngular();
            }
            await BrowserApi.sleep(this.options.pageLoadTimeOut);
        }
        if (instruct.byAction) {
            instruct.byAction();
        }
        else if (instruct.byActionAsync) {
            await instruct.byActionAsync();
        }
        await awaiter();
    }

    /**
     * should not be used, is not declared as private in code, for testing capability.
     * @private
     */
    async openAndGeneratePageObject(params: IOpenAndGeneratePageObjectInstruct): Promise<IPageObjectInFabrication> {
        const generateGeneratedPageObject: GeneratedPageObjectCodeGenerator = new GeneratedPageObjectCodeGenerator(this.options);
        const generateExtendingPageObject: ExtendingPageObjectCodeGenerator = new ExtendingPageObjectCodeGenerator();

        const generatedPageObjectPath: Path = this.packagePath.getFilePath(params.pageObjectName, params.instructPath, false);
        const generatedExtendingPageObjectPath: Path = this.packagePath.getFilePath(params.pageObjectName, params.instructPath, true);

        const generatedPageObject: string =
            generateGeneratedPageObject.generatePageObject({
                pageName: params.pageObjectName,
                generatedPageObjectPath,
                elementTreeRoot: params.e2eElementTree,
                childPages: params.childPages,
                codeBuilder: this.options.codeBuilder!,
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
                    this.options.codeBuilder!,
                    generatedExtendingPageObjectPath,
                    generatedPageObjectPath
                );
            if (!params.instruct.virtual) {
                this.writePageObject(generatedExtendingPageObject, generatedExtendingPageObjectPath);
            }
        }

        const generatedPageObjectWithoutChildren: string =
            generateGeneratedPageObject.generatePageObject({
                pageName: params.pageObjectName,
                elementTreeRoot: params.e2eElementTree,
                childPages: [],
                codeBuilder: this.options.codeBuilder!,
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
