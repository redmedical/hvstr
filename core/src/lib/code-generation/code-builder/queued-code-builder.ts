import { CodeBuilder } from './code-builder';
import { IQueueStep } from './queued-code-builder/queue-step';
import { StringLineStep } from './queued-code-builder/string-line-step';
import { StringConditionalLineStep } from './queued-code-builder/string-condition-line-step';
import { StringDynamicConditionalLineStep } from './queued-code-builder/string-dynamic-conditional-line-step';
import { DynamicStringLineStep } from './queued-code-builder/dynamic-string-line-step';
import { IncreaseDepthStep } from './queued-code-builder/increase-depth-step';
import { DecreaseDepthStep } from './queued-code-builder/decrease-depth-step';
import { CodeBuilderImports } from './code-builder-imports';

/**
 * The QueuedCodeBuilder class is destined to build and generate the code of the page-objects.
 * The QueuedCodeBuilder handles the tab depth of the code.
 *
 * @export
 * @class QueuedCodeBuilder
 */
export class QueuedCodeBuilder{

    private imports: CodeBuilderImports;

    private queue: IQueueStep[];


    /**
     * Creates an instance of QueuedCodeBuilder.
     * @param {string} tab Defines how tabs should look.
     * @memberof QueuedCodeBuilder
     */
    constructor(private tab: string) {
        this.queue = [];
        this.imports = new CodeBuilderImports();
    }

    /**
     * Evaluates all Steps in the Queue.
     *
     * @returns {string}
     * @memberof QueuedCodeBuilder
     */
    getResult(): string {
        const cb = new CodeBuilder(this.tab);
        this.queue.forEach(step => step.execute(cb));
        return cb.getResult();
    }

    /**
     * Adds a simple Line of code.
     *
     * ```ts
     * queuedCodeBuilder.addLine('some code');
     * ```
     *
     * @param {string} content The content
     * @returns {QueuedCodeBuilder}
     * @memberof QueuedCodeBuilder
     */
    addLine(content: string): QueuedCodeBuilder {
        this.queue.push(new StringLineStep(content));
        return this;
    }

    /**
     * Adds a simple Line of code, if the condition/ the boolean is true.
     *
     * ```ts
     * queuedCodeBuilder.addLineCondition(`navigateTo = () => browser.get(this.route);`, Boolean(route));
     * ```
     *
     * @param {string} content
     * @param {boolean} condition
     * @returns {QueuedCodeBuilder}
     * @memberof QueuedCodeBuilder
     */
    addConditionalLine(content: string, condition: boolean): QueuedCodeBuilder {
        this.queue.push(new StringConditionalLineStep(content, condition));
        return this;
    }

    /**
     * Adds a simple Line of code, if the condition is true. The condition gets evaluated, when the QueuedCodeBuilder result is requested.
     *
     * ```ts
     * queuedCodeBuilder.addLineDynamicCondition(`navigateTo = () => browser.get(this.route);`, () => Boolean(route));
     * ```
     *
     * @param {string} content
     * @param {() => boolean} condition a function, which returns the conditions.
     * @returns {QueuedCodeBuilder}
     * @memberof QueuedCodeBuilder
     */
    addDynamicConditionalLine(content: string, condition: () => boolean): QueuedCodeBuilder {
        this.queue.push(new StringDynamicConditionalLineStep(content, condition));
        return this;
    }

    /**
     * Adds a simple Line of code. The content is evaluated, when the QueuedCodeBuilder result is requested.
     *
     * ```ts
     * queuedCodeBuilder.addDynamicLine(() => `import { ${protractorImports.join(', ')} } from 'protractor';`);
     * ```
     *
     * @param {() => string} content a function, which returns the content
     * @returns {QueuedCodeBuilder}
     * @memberof QueuedCodeBuilder
     */
    addDynamicLine(content: () => string): QueuedCodeBuilder {
        this.queue.push(new DynamicStringLineStep(content));
        return this;
    }

    /**
     * increases the tab depth
     *
     * ```ts
     * queuedCodeBuilder
     *     .addLine('function foo() {')
     *     .increaseDepth()
     *         .addLine('bar()')
     *     .decreaseDepth()
     *     .addLine('function foo() }')
     * ```
     *
     * @returns {QueuedCodeBuilder}
     * @memberof QueuedCodeBuilder
     */
    increaseDepth(): QueuedCodeBuilder {
        this.queue.push(new IncreaseDepthStep());
        return this;
    }

    /**
     * decreases the tab depth
     *
     * ```ts
     * queuedCodeBuilder
     *     .addLine('function foo() {')
     *     .increaseDepth()
     *         .addLine('bar()')
     *     .decreaseDepth()
     *     .addLine('function foo() }')
     * ```
     *
     * @returns {QueuedCodeBuilder}
     * @memberof QueuedCodeBuilder
     */
    decreaseDepth(): QueuedCodeBuilder {
        this.queue.push(new DecreaseDepthStep());
        return this;
    }

    /**
     * add an import to the CodeBuilder Instance.
     *
     * @param {string} element which element should be imported. ```import {<Element>} from '...'```
     * @param {string} from which library should imported. ```import {...} from '<From>'```
     * @param {string} [importAs] use alias for this element. ```import {<Element> as <importAs>} from '...'```
     * @returns {QueuedCodeBuilder}
     * @memberof QueuedCodeBuilder
     */
    addImport(element: string, from: string, importAs?: string): QueuedCodeBuilder {
        this.imports.add(element, from, importAs);
        return this;
    }

    /**
     * determines the location where all imports from the CodeBuilder instance should be placed.
     *
     * @returns {QueuedCodeBuilder}
     * @memberof QueuedCodeBuilder
     */
    addImportStatements(): QueuedCodeBuilder {
        this.queue.push(this.imports);
        return this;
    }

    /**
     * resets the QueuedCodeBuilder queue
     *
     * @returns {QueuedCodeBuilder}
     * @memberof QueuedCodeBuilder
     */
    reset(): QueuedCodeBuilder {
        this.queue = [];
        this.imports.reset();
        return this;
    }
}
