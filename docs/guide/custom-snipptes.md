# Custom Snippets
Assumed that you need a custom function for your elements, HVSTR has the custom snippets feature.
It allows you to add code to the page-object generation process, which will be added,
if a given condition is true.

#### Example
When you are using a Angular Material Checkbox, the implementation looks something like this:
```html
<mat-checkbox class="terms" formControlName="terms" e2e="accept-agreements-checkbox" required>Hiermit stimme ich dem <a
    href="/assets/documents/data_processing_contract.pdf"
    target="_blank">Auftrags&shy;daten&shy;verarbeitungs&shy;vertrag</a> zu.
</mat-checkbox>
```
but when it is rendered in the dom:
```html
<mat-checkbox _ngcontent-c0="" class="terms mat-checkbox mat-accent ng-untouched ng-pristine ng-invalid" e2e="accept-agreements-checkbox"
    formcontrolname="terms" required="" id="mat-checkbox-1"><label class="mat-checkbox-layout" for="mat-checkbox-1-input">
        <div class="mat-checkbox-inner-container"><input class="mat-checkbox-input cdk-visually-hidden" type="checkbox"
                id="mat-checkbox-1-input" required="" tabindex="0" aria-label="" aria-checked="false">
            <div class="mat-checkbox-ripple mat-ripple" matripple=""></div>
            <div class="mat-checkbox-frame"></div>
            <div class="mat-checkbox-background"><svg xml:space="preserve" class="mat-checkbox-checkmark" focusable="false"
                    version="1.1" viewBox="0 0 24 24">
                    <path class="mat-checkbox-checkmark-path" d="M4.1,12.7 9,17.6 20.3,6.3" fill="none" stroke="white"></path>
                </svg>
                <div class="mat-checkbox-mixedmark"></div>
            </div>
        </div><span class="mat-checkbox-label"><span style="display:none">&nbsp;</span>I accept the <a
                _ngcontent-c0="" href="/assets/documents/data_processing_contract.pdf" target="_blank">Auftrags&shy;daten&shy;verarbeitungs&shy;vertrag</a>
            zu.
        </span>
    </label>
</mat-checkbox>
```

To select the checkboxwe need to click the  ```div``` with the class ```mat-checkbox-inner-container```. therefore, the following custom snippet generates automatically the right element getter function.:

The first step is to call ```add``` function.
```ts
pageObjectBuilder.customSnippets.add({
```

the first parameter is the condition function.:
```ts
    condition: (element: E2eElement) => element.type === 'MAT-CHECKBOX',
```

the second one is the callback function, which generates the function. Take a look at the [QueuedCodeBuilder](../api/core/classes/queuedcodebuilder.html) Documentation.
```ts
    callBack: async (element: E2eElement, codeBuilder: QueuedCodeBuilder, protractorImports: string[]) => {
            const functionName: string = Utils.getFunctionNameForElement(
                element.conflictFreeId || element.id,
            );
            const parameterString = element.getterFunction.parameters
                .map(x => x.name + ': ' + x.type)
                .join(', ');
            codeBuilder
                .addLine(`${functionName}Input(${parameterString}) {`)
                .increaseDepth()
                .addLine(
                    `return this.${element.getterFunction.functionName}` + 
                    `(${element.getterFunction.parameters.join(', ')})` +
                    `.element(by.css('div.mat-checkbox-inner-container'));`
                )
                .decreaseDepth()
                .addLine(`}`);
    }
});
```
now the page-object contains our new function.:
```ts
  // ElementType: MAT-CHECKBOX
  getAcceptAgreementsCheckbox(): ElementFinder {
    return this.getSummaryPageStep().element(by.css('.e2e-accept-agreements-checkbox'));
  }
  getAcceptAgreementsCheckboxInput() {
    return this.getAcceptAgreementsCheckbox().element(by.css('div.mat-checkbox-inner-container'));
  }
```

## Continue
* [Previous Step - Add Methods](./add-methodes.md)
* [Next Step - Name Conflicts](./name-conflicts.md)
