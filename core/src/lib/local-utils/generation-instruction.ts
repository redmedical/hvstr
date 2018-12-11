import { IPageObjectInFabrication } from '../page-object/page-object-in-fabrication';
import { Awaiter } from './types';

/**
 * The IGenerationInstruction is an interface, which is expected, for the [generate](../classes/_lib_page_object_builder_.pageobjectbuilder.html#generate),
 * [append](../classes/_lib_page_object_builder_.pageobjectbuilder.html#append)
 * and [append child](../classes/_lib_page_object_builder_.pageobjectbuilder.html#appendchild) operations
 * of the [PageObjectBuilder](../classes/_lib_page_object_builder_.pageobjectbuilder.html).
 *
 * @export
 * @interface IGenerationInstruction
 */
export interface IGenerationInstruction {
    /**
     * The name parameter defines the name for the class of the page-object. It is expected in PascalCase.
     * For the [generate](../classes/_lib_page_object_builder_.pageobjectbuilder.html#generate)
     * and [append child](../classes/_lib_page_object_builder_.pageobjectbuilder.html#appendchild) operation it is expected to be defined.
     * Otherwise an Error will be thrown.
     * For the [append](../classes/_lib_page_object_builder_.pageobjectbuilder.html#append) operation the name parameter will be ignored.
     *
     * @type {string}
     * @memberof IGenerationInstruction
     */
    name?: string;

    /**
     * Navigates to a specific route.
     * Example:
     *   ```ts
     *   pageObjectBuilder.generate({
     *       byRoute: '/home',
     *       <...>
     *   });
     *   ```
     *   This snippet will first navigate to the page '/home' and then the pageObject generation process begins.
     *
     * @type {string}
     * @memberof IGenerationInstruction
     */
    byRoute?: string;

    /**
     * The same, as [byActionAsync](#byactionasync) except, that the call will not be awaited.
     *
     * @memberof IGenerationInstruction
     */
    byAction?: () => void;

    /**
     * The byActionAsync parameter can be used, to perform some actions, before the page-object is build.
     * Example:
     *   ```ts
     *   let step1 = await pageObjectBuilder.generate({
     *       name: 'Page1',
     *       byRoute: '/home'
     *   });
     *   let step2 = await step1.append({
     *       byAction: () => {
     *           await step1.getButton().click();
     *       }
     *   });
     *   ```
     *   This snippet would perform a click on the button on page1, before the content gets merged to page1;
     *
     * @memberof IGenerationInstruction
     */
    byActionAsync?: () => Promise<void>;

    /**
     * Restricts the page-objects to children, which have one of the id's are listed in the  restrictToElements parameter.
     * Example:
     *   template;
     *   ```html
     *   <div e2e="area1">
     *       <button e2e="button1" />
     *   </div>
     *   <div e2e="area2">
     *       <button e2e="button2" />
     *   </div>
     *   <div e2e="area3">
     *       <button e2e="button3" />
     *   </div>
     *   ```
     *   generation instruct:
     *   ```ts
     *   let step1 = await pageObjectBuilder.generate({
     *       name: 'HomePage',
     *       byRoute: '/home',
     *       restrictToElements: [
     *           'area3'
     *       ]
     *   });
     *   ```
     *   in this example, just the div with the id area3 and his child's will be in the page-object.
     *
     * @type {string[]}
     * @memberof IGenerationInstruction
     */
    restrictToElements?: string[];

    /**
     * Excludes children from the page-objects, which have one of the id's are listed in the excludeElements parameter.
     * Example:
     *   template;
     *   ```html
     *   <div e2e="area1">
     *       <button e2e="button1" />
     *   </div>
     *   <div e2e="area2">
     *       <button e2e="button2" />
     *   </div>
     *   <div e2e="area3">
     *       <button e2e="button3" />
     *   </div>
     *   ```
     *   generation instruct:
     *   ```ts
     *   let step1 = await pageObjectBuilder.generate({
     *       name: 'HomePage',
     *       byRoute: '/home',
     *       excludeElements: [
     *           'area3'
     *       ]
     *   });
     *   ```
     *   in this example, just the div with the id area3 and his child's will not be in the page-object.
     *
     * @type {string[]}
     * @memberof IGenerationInstruction
     */
    excludeElements?: string[];

    /**
     * The path parameter defines a child-path to the page-object root path, where the new page-object will be written to.
     * This parameter is optional. If not set, the page-object root path will be used to store the page-objects.
     *
     * @type {string}
     * @memberof IGenerationInstruction
     */
    path?: string;

    /**
      * The from parameter overwrites the origin, for the recursive execution of the 'byPreparer'.
      * This is useful, when you want to generate a specific generation step from a individual state/point.
     *
     *   Examples:
     *
     *   ```ts
     *   let page1 = await pageObjectBuilder.generate({
        *       name: 'Page1',
        *       byRoute: '/home'
        *   });
        *   <...>
        *   let page2 = await pageObjectBuilder.generate({
        *       name: 'Page2',
        *       from: page1
        *   });
        *   ```
        *   In this snippet, before page2 is generated, the 'byPreparer' of Page1 is executed.
        *
        *
        *   ```ts
        *   let step1 = await pageObjectBuilder.generate({
        *       name: 'Page1',
        *       byRoute: '/home'
        *   });
        *   let step2 = await page1.append({
        *       byActionAsync: () => {
        *           await step1.getButton1().click();
        *       }
        *   });
        *   let step3 = await page2.append({
        *       from: page1,
        *       byActionAsync: () => {
        *           await step1.getButton2().click();
        *       }
        *   });
        *   ```
        *   In this example, the steps would be preceded as follows:
        *   1. The page-object would be generated in step one by navigating to the route '/home'
        *   2. The second Step would append the new content, by first executing his origin,
        * which is step 1. So it navigates to the route '/home' again and afterwards, it will perform the action, to click on the button1.
        *   3. In the last step the new content would be appended to the result of the second step, but the origin is overwritten,
        * by the 'from' parameter, so it will navigate to the route '/home' and perform the action from step3, to click on button2.
        *
     *
     * @type {IPageObjectInFabrication}
     * @memberof IGenerationInstruction
     */
    from?: IPageObjectInFabrication;

    /**
     * The ```Awaiter``` is a function, which will be executed twice during the 'byPreparer'.
     * It has an optional Parameter, which identifies the call. The first call (callindex 1), is after the navigation. The second call is after the action.
     * Example:
     *   ```ts
     *   let step1 = await pageObjectBuilder.generate({
     *       name: 'Page1',
     *       byRoute: '/home',
     *       awaiter: (callindex) => {
     *           if(callindex == 1) {
     *               await browser.sleep(500);
     *           }
     *       }
     *   });
     *   ```
     * @type {Awaiter}
     * @memberof IGenerationInstruction
     */
    awaiter?: Awaiter;

    /**
     * If the virtual flag is set to true, the page-object, will only be generated and returned, but not written to the page-object directory.
     * This can be used, for test or to execute hvstr, without manipulating any files.
     *
     * @type {boolean}
     * @memberof IGenerationInstruction
     */
    virtual?: boolean;

}
