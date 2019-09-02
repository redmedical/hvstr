# Custom Snippets
Assumed that you need hvstr to generate some custom functionality for your elements. Therefore hvstr has the custom snippets feature.
It allows you to add code to the page-object generation process, which will be added, under a given condition.

There are three different types of custom snippets. Each type will be generated at a different location in the code:

* ### CustomSnippets For Getter functions
This type of custom snippets will be placed after each getter function of an element. It enables you to add custom function, which for example can toggle an element or selecting an sub element. For this type you will need to generate a function header, because your code will be placed inside the page-object class.


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

To select the checkbox we need to click the  ```div``` with the class ```mat-checkbox-inner-container```. therefore, the following custom snippet generates automatically the right element getter function.:

The first step is to call ```addForGetterFunctions``` function.
```ts
pageObjectBuilder.customSnippets.addForGetterFunctions({
```

the first parameter is the condition function.:
```ts
    condition: (element: E2eElement) => element.type === 'MAT-CHECKBOX',
```

the second one is the callback function, which generates the function. Take a look at the [QueuedCodeBuilder](../api/core/classes/queuedcodebuilder.html) Documentation.
```ts
    callBack: async (element: E2eElement, codeBuilder: QueuedCodeBuilder) => {
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

* ### CustomSnippets For FillForm

In this type you can extend the [FillForm](./add-meethodes.md#addfillform) methode, to let you fill out your custom form elements.
The fillForm methode requires a data parameter. You can define the type in the custom snippet.

#### Example
this custom snippet:
```ts
    pageObjectBuilder.customSnippets.addForFillForm({
        condition: (element) => element.type === 'INPUT', // Add this custom snippet for all elements of type input
        callBack: async (
            element: E2eElement,
            codeBuilder: QueuedCodeBuilder,
            options: IPageObjectBuilderOptions,
        ) => {
            codeBuilder
                .addLine(`if (data.${Utils.firstCharToLowerCase(element.id)}) {`) // make sure, if the entity on the data object is set
                .increaseDepth()
                .addLine(`await this.get${element.id}().sendKeys(data.${Utils.firstCharToLowerCase(element.id)});`)
                .decreaseDepth()
                .addLine('}');
        },
        type: 'string', // fillForm requires type string for this field
    });
```
will look like this in your page-object:

```ts
 async fillForm(
    data: {
      // [...]
      nameInput?: string;
      // [...]
    },
  ) {
    // [...]
    if (data.nameInput) {
      await this.getNameInput().sendKeys(data.nameInput);
    }
    // [...]
  }
```

* ### CustomSnippets For ClearForm


In this type you can extend the [ClearForm](./add-methods.md#addfillform) methode, to let you clear your form elements.

#### Example
this custom snippet:
```ts
   pageObjectBuilder.customSnippets.addForClearForm({
        condition: (element) => element.type === 'INPUT',
        callBack: async (
            element: E2eElement,
            codeBuilder: QueuedCodeBuilder,
            options: IPageObjectBuilderOptions,
        ) => {
            codeBuilder
                .addLine('{') // create scope vor variables
                .increaseDepth()
                .addLine(`const input = this.get${element.id}();`)
                .addLine(`const value: string = await input.getAttribute('value');`)
                .addLine('for (let i = 0; i < value.length; i++) {')
                .increaseDepth()
                .addImport('protractor', 'protractor/built/ptor') // Add needed import
                .addLine('await input.sendKeys(protractor.Key.BACK_SPACE);')
                .decreaseDepth()
                .addLine('}')
                .decreaseDepth()
                .addLine('}');
        },
    });
```
will look like this in your page-object:

```ts
 async clearForm() {
    // [...]
    {
      const input = this.getNameInput();
      const value: string = await input.getAttribute('value');
      for (let i = 0; i < value.length; i++) {
          await input.sendKeys(protractor.Key.BACK_SPACE);
      }
    }
    // [...]
  }
```


## Continue
* [Previous Step - Add Methods](./add-methodes.md)
* [Next Step - Name Conflicts](./name-conflicts.md)
