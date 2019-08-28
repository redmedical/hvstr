import { QueuedCodeBuilder } from './code-generation/code-builder/queued-code-builder';
import { Awaiter } from './local-utils/types';
import { IOptionalLogger, ILogger } from './local-utils/logger';

export interface IPageObjectBuilderInputOptions {
    /**
     * Defines the CodeBuilder. See more at QueuedCodeBuilder
     *
     * @type {QueuedCodeBuilder}
     * @default new QueuedCodeBuilder('  ')
     */
    codeBuilder?: QueuedCodeBuilder;
    /**
     * Action that should be performed normally. See more at IGenerationInstruct
     *
     * @type {Awaiter}
     * @default () => {}
     */
    awaiter?: Awaiter;
    /**
     * Defines the root-path, where the page-objects should be stored
     *
     * @type {string}
     * @default '/e2e'
     */
    e2eTestPath?: string;
    /**
     * Defines if the protractor-setting WaitForAngular should be enabled or disabled.
     *
     * @type {boolean}
     * @default true
     */
    waitForAngularEnabled?: boolean;
    /**
     * Prevent hvstr from creating default page object directories.
     *
     * @type {boolean}
     */
    doNotCreateDirectories?: boolean;
    /**
     * Add browser parameter to page-objects constructor, to enable support of forked browser instances.
     * ([browser.forkNewDriverInstance](https://www.protractortest.org/#/api?view=ProtractorBrowser.prototype.forkNewDriverInstance))
     *
     * the page-objects constructor will look something like this.:
     * ```ts
     * constructor(
     *     browser?: ProtractorBrowser = browser
     * ){}
     * ```
     *
     * @type {boolean}
     */
    enableCustomBrowser?: boolean;
    /**
     * define a custom logger.
     *
     * the default logger is silent.
     *
     * @type {ILogger}
     * @memberof IPageObjectBuilderInputOptions
     */
    logger?: IOptionalLogger;
}


/**
 * This interface equals the IPageObjectBuilderInputOptions interface, except the entities with default values are not optional.
 *
 * @export
 * @interface IPageObjectBuilderOptions
 */
export type IPageObjectBuilderOptions = Required<IPageObjectBuilderInputOptions & { logger: ILogger }>;


