import { IE2eElement, Utils } from '@redmedical/HVSTR-utils';
import { browser } from 'protractor';

export class BrowserApi {
    static async getE2eElementTree(): Promise<IE2eElement[]>{
        return browser.executeScript(`return window['${Utils.getE2eElementTreeFunctionName}']()`)
        .then(x => {
            return (x as IE2eElement[]);
        });
    }
    static async getRoute(): Promise<string>{
        return browser.executeScript(`return window.location.pathname + window.location.hash`)
        .then(x => {
            return (x as string);
        });
    }
    static async awaitDocumentToBeReady(): Promise<void>{
        await browser.executeAsyncScript(`
            const protractorCallback = arguments[arguments.length - 1];
            if (document.readyState !== 'loading') {
                protractorCallback();
            }
            document.addEventListener("DOMContentLoaded", (event) => {
                document.removeEventListener('DOMContentLoaded');
                protractorCallback();
            });
        `);
    }
    static async getDocumentReadyState(): Promise<string>{
        const x = await browser.executeScript(`return document.readyState`);
        return (x as string);
    }
}
