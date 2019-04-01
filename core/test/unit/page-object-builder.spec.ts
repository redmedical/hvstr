import { PageObjectBuilder, BrowserApi, IPageObjectInFabrication, IGenerationInstruction } from '../../src';
import { ISimpleE2EElement, IE2eElement } from '@redmedical/hvstr-utils';
import * as elementTreeMerge from '../../src/lib/e2e-element/element-tree-merge';
import { E2eElement } from '../../src/lib/e2e-element/e2e-element';
import * as mergeDuplicateArrayElements from '../../src/lib/conflict-resolver/array-duplicate-merge';
import * as ConflictResolver from '../../src/lib/conflict-resolver/conflict-resolver';

describe('PageObjectBuilder', () => {

    describe('generate', () => {
        const resultObject = <IPageObjectInFabrication>{};
        let pageObjectBuilder: PageObjectBuilder;
        let executeByPreparerSpy: jasmine.Spy;
        let BrowserApiSpy: jasmine.Spy;
        let elementTreeMergeSpy: jasmine.Spy;
        let mergeDuplicateArrayElementsSpy: jasmine.Spy;
        let conflictResolverSpy: jasmine.Spy;
        let openAndGeneratePageObjectSpy: jasmine.Spy;
        let browserWaitForAngularEnabledSpy: jasmine.Spy;
        let awaiterSpy: jasmine.Spy;
        let iE2eElementMock: IE2eElement[];

        beforeEach(async () => {
            iE2eElementMock = <IE2eElement[]><ISimpleE2EElement[]>[ // not all entity's of IE2eElement are needed
                {
                    id: 'A',
                    type: 'DIV',
                    children: [],
                    parent: undefined,
                }
            ];
            awaiterSpy = jasmine.createSpy('awaiter', () => { });
            BrowserApiSpy = spyOn(BrowserApi, 'getE2eElementTree').and.returnValue(new Promise(resolve => resolve(iE2eElementMock)));
            elementTreeMergeSpy = spyOn(elementTreeMerge, 'elementTreeMerge').and.callFake(
                (oldTree: E2eElement[],
                    addendTree: E2eElement[],
                    excludeElements: string[],
                    isRestrictElementsChild: boolean,
                    restrictToElements?: string[],
                    parent?: E2eElement) => addendTree
            );
            mergeDuplicateArrayElementsSpy = spyOn(mergeDuplicateArrayElements, 'mergeDuplicateArrayElements');
            conflictResolverSpy = spyOn(ConflictResolver, 'ConflictResolver');
            browserWaitForAngularEnabledSpy = spyOn(BrowserApi, 'setWaitForAngularEnabled');
            pageObjectBuilder = new PageObjectBuilder({
                awaiter: awaiterSpy,
                waitForAngularEnabled: false,
                e2eTestPath: '/e2e',
                doNotCreateDirectorys: true,
            });
            openAndGeneratePageObjectSpy = spyOn(pageObjectBuilder, 'openAndGeneratePageObject').and.returnValue(new Promise(resolve => resolve(resultObject)));
            executeByPreparerSpy = spyOn(pageObjectBuilder, 'executeByPreparer');
        });

        it('should return a promise and not throw any errors', async () => {
            const callInstruct = {
                name: 'Test',
                byRoute: '/home'
            };
            const result = await <any>pageObjectBuilder.generate(callInstruct);
            expect(result).toBeTruthy();
        });

        it('should throw an error, when no name is passed', async () => {
            const callInstruct = {
                byRoute: '/home'
            };
            await pageObjectBuilder.generate(callInstruct)
                .then(() => fail('no error was thrown!'))
                .catch((err: Error) => {
                    expect(err instanceof Error).toBe(true);
                    expect(err.message).toContain('name');
                });
        });

        it('should return the result object', async () => {
            const callInstruct = {
                name: 'Test',
                byRoute: '/home'
            };
            const result = await <any>pageObjectBuilder.generate(callInstruct);
            expect(result).toBe(<IPageObjectInFabrication>resultObject);
        });

        it('should call byPreparer with instruct', async () => {
            const callInstruct = {
                name: 'Test',
                byRoute: '/home'
            };
            await <any>pageObjectBuilder.generate(callInstruct);
            expect(executeByPreparerSpy).toHaveBeenCalledWith(callInstruct, undefined);
        });

        it('should call mergeDuplicateArrayElements ConflictResolver', async () => {
            const callInstruct = {
                name: 'Test',
                byRoute: '/home'
            };
            await <any>pageObjectBuilder.generate(callInstruct);
            expect(mergeDuplicateArrayElementsSpy).toHaveBeenCalled();
            expect(conflictResolverSpy).toHaveBeenCalled();
        });

        it('should call mergeDuplicateArrayElements ConflictResolver', async () => {
            const callInstruct = {
                name: 'Test',
                byRoute: '/home'
            };
            await <any>pageObjectBuilder.generate(callInstruct);
            expect(openAndGeneratePageObjectSpy).toHaveBeenCalled();
        });
    });

    describe('append', () => {
        const resultObject = <IPageObjectInFabrication>{};
        let scopeMock: any;
        let pageObjectBuilder: PageObjectBuilder;
        let executeByPreparerSpy: jasmine.Spy;
        let BrowserApiSpy: jasmine.Spy;
        let elementTreeMergeSpy: jasmine.Spy;
        let mergeDuplicateArrayElementsSpy: jasmine.Spy;
        let conflictResolverSpy: jasmine.Spy;
        let openAndGeneratePageObjectSpy: jasmine.Spy;
        let browserWaitForAngularEnabledSpy: jasmine.Spy;
        let awaiterSpy: jasmine.Spy;
        let iE2eElementMock: IE2eElement[];
        let callInstruct: {byRoute: string;};

        beforeEach(async () => {
            scopeMock = {
                instruct: {}
            };
            callInstruct = {
                byRoute: '/home'
            };
            iE2eElementMock = <IE2eElement[]><ISimpleE2EElement[]>[ // not all entity's of IE2eElement are needed
                {
                    id: 'A',
                    type: 'DIV',
                    children: [],
                    parent: undefined,
                }
            ];
            awaiterSpy = jasmine.createSpy('awaiter', () => { });
            BrowserApiSpy = spyOn(BrowserApi, 'getE2eElementTree').and.returnValue(new Promise(resolve => resolve(iE2eElementMock)));
            elementTreeMergeSpy = spyOn(elementTreeMerge, 'elementTreeMerge').and.callFake(
                (oldTree: E2eElement[],
                    addendTree: E2eElement[],
                    excludeElements: string[],
                    isRestrictElementsChild: boolean,
                    restrictToElements?: string[],
                    parent?: E2eElement) => addendTree
            );
            mergeDuplicateArrayElementsSpy = spyOn(mergeDuplicateArrayElements, 'mergeDuplicateArrayElements');
            conflictResolverSpy = spyOn(ConflictResolver, 'ConflictResolver');
            browserWaitForAngularEnabledSpy = spyOn(BrowserApi, 'setWaitForAngularEnabled');
            pageObjectBuilder = new PageObjectBuilder({
                awaiter: awaiterSpy,
                waitForAngularEnabled: false,
                e2eTestPath: '/e2e',
                doNotCreateDirectorys: true,
            });
            openAndGeneratePageObjectSpy = spyOn(pageObjectBuilder, 'openAndGeneratePageObject').and.returnValue(new Promise(resolve => resolve(resultObject)));
            executeByPreparerSpy = spyOn(pageObjectBuilder, 'executeByPreparer');
        });

        it('should return a promise and not throw any errors', async () => {
            const result = await <any>pageObjectBuilder.append(callInstruct, <IPageObjectInFabrication>scopeMock);
            expect(result).toBeTruthy();
        });

        it('should return the result object', async () => {
            const result = await <any>pageObjectBuilder.append(callInstruct, <IPageObjectInFabrication>scopeMock);
            expect(result).toBe(<IPageObjectInFabrication>resultObject);
        });

        it('should call byPreparer with instruct', async () => {
            await <any>pageObjectBuilder.append(callInstruct, <IPageObjectInFabrication>scopeMock);
            expect(executeByPreparerSpy).toHaveBeenCalledWith(callInstruct, scopeMock);
        });

        it('should call mergeDuplicateArrayElements ConflictResolver', async () => {
            await <any>pageObjectBuilder.append(callInstruct, <IPageObjectInFabrication>scopeMock);
            expect(mergeDuplicateArrayElementsSpy).toHaveBeenCalled();
            expect(conflictResolverSpy).toHaveBeenCalled();
        });

        it('should call mergeDuplicateArrayElements ConflictResolver', async () => {
            await <any>pageObjectBuilder.append(callInstruct, <IPageObjectInFabrication>scopeMock);
            expect(openAndGeneratePageObjectSpy).toHaveBeenCalled();
        });

        it('should set Path on instruct, when Scope has path prop', async () => {
            scopeMock.instruct.path = '/test';
            await <any>pageObjectBuilder.append(callInstruct, <IPageObjectInFabrication>scopeMock);
            expect((<any>callInstruct)['path']).toBeDefined();
        });
    });

    describe('appendChild', () => {
        const resultObject = <IPageObjectInFabrication>{};
        let scopeMock: any;
        let pageObjectBuilder: PageObjectBuilder;
        let generateSpy: jasmine.Spy;
        let openAndGeneratePageObjectSpy: jasmine.Spy;
        let browserWaitForAngularEnabledSpy: jasmine.Spy;
        let awaiterSpy: jasmine.Spy;
        let iE2eElementMock: ISimpleE2EElement[];

        beforeEach(async () => {
            scopeMock = {
                childPages: [],
                instruct: {}
            };
            iE2eElementMock = <ISimpleE2EElement[]>[
                {
                    id: 'A',
                    type: 'DIV',
                    children: [],
                    parent: undefined,
                }
            ];
            awaiterSpy = jasmine.createSpy('awaiter', () => { });
            browserWaitForAngularEnabledSpy = spyOn(BrowserApi, 'setWaitForAngularEnabled');
            pageObjectBuilder = new PageObjectBuilder({
                awaiter: awaiterSpy,
                waitForAngularEnabled: false,
                e2eTestPath: '/e2e',
                doNotCreateDirectorys: true,
            });
            openAndGeneratePageObjectSpy = spyOn(pageObjectBuilder, 'openAndGeneratePageObject').and.returnValue(new Promise(resolve => resolve(resultObject)));
            generateSpy = spyOn(pageObjectBuilder, 'generate');
            spyOn(pageObjectBuilder, 'getEmptyInstructFromOrigin');
        });

        it('should return a promise and not throw any errors', async () => {
            const callInstruct = {
                name: 'Test',
                byRoute: '/home'
            };
            const result = await <any>pageObjectBuilder.appendChild(callInstruct, <IPageObjectInFabrication>scopeMock);
            expect(result).toBeTruthy();
        });

        it('should throw an error, when no name is passed', async () => {
            const callInstruct = {
                byRoute: '/home'
            };
            await pageObjectBuilder.appendChild(callInstruct, <IPageObjectInFabrication>scopeMock)
                .then(() => fail('no error was thrown!'))
                .catch((err: Error) => {
                    expect(err instanceof Error).toBe(true);
                    expect(err.message).toContain('name');
                });
        });

        it('should return the result object', async () => {
            const callInstruct = {
                name: 'Test',
                byRoute: '/home'
            };
            const result = await <any>pageObjectBuilder.appendChild(callInstruct, <IPageObjectInFabrication>scopeMock);
            expect(result).toBe(<IPageObjectInFabrication>resultObject);
        });

        it('should call byPreparer with instruct', async () => {
            const callInstruct = {
                name: 'Test',
                byRoute: '/home'
            };
            await <any>pageObjectBuilder.appendChild(callInstruct, <IPageObjectInFabrication>scopeMock);
            expect(generateSpy).toHaveBeenCalledWith(callInstruct, scopeMock);
        });

        it('should call mergeDuplicateArrayElements ConflictResolver', async () => {
            const callInstruct = {
                name: 'Test',
                byRoute: '/home'
            };
            await <any>pageObjectBuilder.appendChild(callInstruct, <IPageObjectInFabrication>scopeMock);
            expect(openAndGeneratePageObjectSpy).toHaveBeenCalled();
        });
    });

    describe('addNavigateTo', () => {
        const resultObject = <IPageObjectInFabrication>{};
        let scopeMock: any;
        let pageObjectBuilder: PageObjectBuilder;
        let openAndGeneratePageObjectSpy: jasmine.Spy;
        let browserWaitForAngularEnabledSpy: jasmine.Spy;
        let browserGetRouteSpy: jasmine.Spy;
        let awaiterSpy: jasmine.Spy;

        beforeEach(async () => {
            scopeMock = {
                childPages: [],
                instruct: {}
            };
            awaiterSpy = jasmine.createSpy('awaiter', () => { });
            browserWaitForAngularEnabledSpy = spyOn(BrowserApi, 'setWaitForAngularEnabled');
            browserGetRouteSpy = spyOn(BrowserApi, 'getRoute');
            pageObjectBuilder = new PageObjectBuilder({
                awaiter: awaiterSpy,
                waitForAngularEnabled: false,
                e2eTestPath: '/e2e',
                doNotCreateDirectorys: true,
            });
            openAndGeneratePageObjectSpy = spyOn(pageObjectBuilder, 'openAndGeneratePageObject').and.returnValue(new Promise(resolve => resolve(resultObject)));
            spyOn(pageObjectBuilder, 'getEmptyInstructFromOrigin');
        });

        it('should return a promise and not throw any errors', async () => {
            const result = await <any>pageObjectBuilder.addNavigateTo(<IPageObjectInFabrication>scopeMock);
            expect(result).toBeTruthy();
        });

        it('should call getRoute', async () => {
            await <any>pageObjectBuilder.addNavigateTo(<IPageObjectInFabrication>scopeMock);
            expect(browserGetRouteSpy).toHaveBeenCalled();
        });
    });

    describe('addFillForm', () => {
        const resultObject = <IPageObjectInFabrication>{};
        let scopeMock: any;
        let pageObjectBuilder: PageObjectBuilder;
        let openAndGeneratePageObjectSpy: jasmine.Spy;
        let browserWaitForAngularEnabledSpy: jasmine.Spy;
        let awaiterSpy: jasmine.Spy;

        beforeEach(async () => {
            scopeMock = {
                childPages: [],
                instruct: {}
            };
            awaiterSpy = jasmine.createSpy('awaiter', () => { });
            browserWaitForAngularEnabledSpy = spyOn(BrowserApi, 'setWaitForAngularEnabled');
            pageObjectBuilder = new PageObjectBuilder({
                awaiter: awaiterSpy,
                waitForAngularEnabled: false,
                e2eTestPath: '/e2e',
                doNotCreateDirectorys: true,
            });
            openAndGeneratePageObjectSpy = spyOn(pageObjectBuilder, 'openAndGeneratePageObject').and.returnValue(new Promise(resolve => resolve(resultObject)));
            spyOn(pageObjectBuilder, 'getEmptyInstructFromOrigin');
        });

        it('should return a promise and not throw any errors', async () => {
            const result = await <any>pageObjectBuilder.addFillForm(<IPageObjectInFabrication>scopeMock);
            expect(result).toBeTruthy();
        });
    });

    describe('executeByPreparer', () => {
        let pageObjectBuilder: PageObjectBuilder;
        let browserWaitForAngularEnabledSpy: jasmine.Spy;
        let browserNavigate: jasmine.Spy;
        let browserAwaitDocumentToBeReady: jasmine.Spy;
        let browserSleep: jasmine.Spy;
        let browserWaitForAngular: jasmine.Spy;
        let awaiterSpy: jasmine.Spy;
        let actionSpy: jasmine.Spy;
        beforeEach(async () => {
            awaiterSpy = jasmine.createSpy('awaiter', () => { });
            browserWaitForAngularEnabledSpy = spyOn(BrowserApi, 'setWaitForAngularEnabled');
            browserNavigate = spyOn(BrowserApi, 'navigate');
            browserAwaitDocumentToBeReady = spyOn(BrowserApi, 'awaitDocumentToBeReady');
            browserSleep = spyOn(BrowserApi, 'sleep');
            browserWaitForAngular = spyOn(BrowserApi, 'waitForAngular');
            actionSpy = jasmine.createSpy('action');
            pageObjectBuilder = new PageObjectBuilder({
                awaiter: awaiterSpy,
                waitForAngularEnabled: false,
                e2eTestPath: '/e2e',
                doNotCreateDirectorys: true,
            });
            spyOn(pageObjectBuilder, 'getEmptyInstructFromOrigin');
        });

        it('should not throw any errors', async () => {
            const instruct = {};
            await pageObjectBuilder.executeByPreparer(instruct, undefined);
        });

        it('should call awaiter twice', async () => {
            const instruct: IGenerationInstruction = {};
            await pageObjectBuilder.executeByPreparer(instruct, undefined);
            expect(awaiterSpy).toHaveBeenCalledTimes(2);
        });

        it('should call navigate to route from instruct', async () => {
            const instruct: IGenerationInstruction = {
                byRoute: '/home'
            };
            await pageObjectBuilder.executeByPreparer(instruct, undefined);
            expect(browserNavigate).toHaveBeenCalledWith(instruct.byRoute);
        });

        it('should execute action from instruct', async () => {
            const instruct: IGenerationInstruction = {
                byAction: actionSpy
            };
            await pageObjectBuilder.executeByPreparer(instruct, undefined);
            expect(actionSpy).toHaveBeenCalled();
        });

        it('should execute  async action from instruct and resolve promise after async action resolved promise', async () => {
            let actionSpyFinished: boolean = false;
            actionSpy.and.callFake(async () => new Promise((resolve) => {
                setTimeout(() => {
                    actionSpyFinished = true;
                    resolve();
                }, 10);
            }));
            const instruct: IGenerationInstruction = {
                byActionAsync: actionSpy
            };
            await pageObjectBuilder.executeByPreparer(instruct, undefined);
            expect(actionSpyFinished).toBe(true);
            expect(actionSpy).toHaveBeenCalled();
        });

        it('should redirect, execute action and async action from instruct', async () => {
            const instruct: IGenerationInstruction = {
                byRoute: '/home',
                byAction: actionSpy,
            };
            await pageObjectBuilder.executeByPreparer(instruct, undefined);
            expect(browserNavigate).toHaveBeenCalledWith(instruct.byRoute);
            expect(actionSpy).toHaveBeenCalled();
        });

        it('should execute action and not async action from instruct', async () => {

            const asyncActionSpy = jasmine.createSpy('async-action').and.returnValue(Promise.resolve());
            const instruct: IGenerationInstruction = {
                byAction: actionSpy,
                byActionAsync: asyncActionSpy,
            };
            await pageObjectBuilder.executeByPreparer(instruct, undefined);
            expect(actionSpy).toHaveBeenCalled();
            expect(asyncActionSpy).not.toHaveBeenCalled();
        });

        it('should call wait for angular after redirect', async () => {
            pageObjectBuilder = new PageObjectBuilder({
                waitForAngularEnabled: true,
                doNotCreateDirectorys: true,
            });
            const instruct: IGenerationInstruction = {
                byRoute: '/home',
            };
            await pageObjectBuilder.executeByPreparer(instruct, undefined);
            expect(browserWaitForAngular).toHaveBeenCalled();
        });

        it('should call navigate to route from instruct "from" instruct', async () => {
            const instruct: IGenerationInstruction = {
                // Important: not all entities of IPageObjectInFabrication are needed for executeByPreparer
                from: <IPageObjectInFabrication><any>{
                    origin: undefined,
                    instruct: <IGenerationInstruction>{
                        byRoute: '/home',
                    }
                }
            };
            await pageObjectBuilder.executeByPreparer(instruct, undefined);
            expect(browserNavigate).toHaveBeenCalledWith(instruct.from!.instruct.byRoute);
        });

        it('should call action from instruct and instructs "from" instruct', async () => {
            const instructAction = jasmine.createSpy('instructAction');
            const instructFromAction = jasmine.createSpy('instructFromAction');
            const instruct: IGenerationInstruction = {
                byAction: instructAction,
                // Important: not all entities of IPageObjectInFabrication are needed for executeByPreparer
                from: <IPageObjectInFabrication><any>{
                    origin: undefined,
                    instruct: <IGenerationInstruction>{
                        byAction: instructFromAction,
                    }
                }
            };
            await pageObjectBuilder.executeByPreparer(instruct, undefined);
            expect(instructAction).toHaveBeenCalled();
            expect(instructFromAction).toHaveBeenCalled();
        });

        it('should call action from instruct and  origins instruct', async () => {
            const instructAction = jasmine.createSpy('instructAction');
            const instructOrigin = jasmine.createSpy('instructFromAction');
            const origin:IPageObjectInFabrication = <any>{
                origin: undefined,
                instruct: <IGenerationInstruction>{
                    byAction: instructOrigin,
                }
            };
            const instruct: IGenerationInstruction = {
                // Important: not all entities of IPageObjectInFabrication are needed for executeByPreparer
                byAction: instructAction,
            };
            await pageObjectBuilder.executeByPreparer(instruct, origin);
            expect(instructAction).toHaveBeenCalled();
            expect(instructOrigin).toHaveBeenCalled();
        });
    });
});
