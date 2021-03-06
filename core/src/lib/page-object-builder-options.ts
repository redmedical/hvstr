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
     * define a custom logger.
     *
     * the default logger is silent.
     *
     * @type {ILogger}
     * @memberof IPageObjectBuilderInputOptions
     */
    logger?: IOptionalLogger;
    /**
     * Time to wait after document is ready and if wait for angular enabled, is ready, before generating page object.
     *
     * @type {number} ms
     */
    pageLoadTimeOut?: number;
}


/**
 * This interface equals the IPageObjectBuilderInputOptions interface, except the entities with default values are not optional.
 *
 * @export
 * @interface IPageObjectBuilderOptions
 */
export type IPageObjectBuilderOptions = Required<IPageObjectBuilderInputOptions & { logger: ILogger }>;


