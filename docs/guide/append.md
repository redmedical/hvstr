# generate page-object through several steps or compose through several steps
Generating page-objects requires sometimes(or often) to proceed through several actions on the page, which reveal different elements.

For example: you have administrative page, but no initial entry's. But you need also the present elements, from the data less page. (For example a "No entry's" Message)

Therefor HVSTR has the append method.

## Append
On every generated page-object you have several helper methods at generating time.
(See [IPageObjectInFabrication](../api/core/interfaces/ipageobjectinfabrication.html)) one of those is ```append```.
Append merges two states of a page into one page-object.  
Append expects a [```IGenerationInstruction```](../api/core/interfaces/igenerationinstruction.html). In this instruct, with the byAction and byActionAsync parameter, you can define the actions, to get the state of the page-object, which will be merged.

#### Example:
```ts
const emptyUserPage = await pageObjectBuilder.generate({
    name: 'UserPage',
    byRoute: '/user',
});

const finalUserPage = await emptyUserPage.append({
    byActionAsync: async () => {
        // Steps needed to reach the second state
        await emptyUserPage.getAddUserButton().click();
    }
});
```
In this example the 'UserPage' gets opened and a page-object is generated. The generated page-object is stored in your filesystem. Afterwards, the async action is executed, so the 'addUserButton' from the first state is clicked. When the action has finished, all new Elements will be merged with the old page-object. A new instance of a [IPageObjectInFabrication](../api/core/interfaces/ipageobjectinfabrication.html) is returned, which has both properties, of the old and the new state. This page-object overwrites the old one in the filesystem.


## AppendChild
Many pages have a complex structure, so the page-objects can become confusing and messy. Therefor HVSTR has a solution to build complex pages with a compositional structure. With ```appendChild``` you can composite a new part to the page-object.  
AppendChild expects a
[```IGenerationInstruction```](../api/core/interfaces/igenerationinstruction.html).
In the instruct, with the
[```excludeElements```](../api/core/interfaces/igenerationinstruction.html#excludeelements)
and the
[```restrictToElements```](../api/core/interfaces/igenerationinstruction.html#restricttoelements)
parameter, you can encapsulate, which part should be in the parent and which in the child page-object. It is also possible to define actions, like the in the instruct from the [append method](#append).

#### Example:
```ts
let complexPage = await pageObjectBuilder.generate({
    name: 'ComplexPage',
    byRoute: '/complex',
    excludeElements: ['ComplexPartOne']
});

complexPage = await complexPage.appendChild({
    name: 'ComplexPartOne',
    restrictToElements: ['ComplexPartOne']
});
```
In this example a page-object 'ComplexPage' with the child page-object 'ComplexPartOne' is generated. The 'ComplexPage' will look something like this: 
```ts
export class ComplexPage {
    public complexPartOne: ComplexPartOne;
    constructor() {
        this.complexPartOne = new ComplexPartOne();
    }
}
```
so you can access the 'complexPartOne' as a property of the parent page-object, which is instantiated with the parent page-object.

__Important__: the child-page-object needs a name!


## Continue
* [Previous Step - Array-like recurring elements](./array.md)
* [Next Step - Add Methods](./add-methods.md)
