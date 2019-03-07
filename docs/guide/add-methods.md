# Add Methods
hvstr provides an interface, to add useful methods to a page-object.

## AddNavigateTo
call the
[```addNavigateTo```](../api/core/interfaces/ipageobjectinfabrication.html#addnavigateto)
on a
[IPageObjectInFabrication](../api/core/interfaces/ipageobjectinfabrication.html) to add the ```navigateTo``` method.

#### Example:
```ts
let homePage = await pageObjectBuilder.generate({
    name: 'HomePage',
    byRoute: '/home',
});
homePage = await homePage.addNavigateTo();
```

the generated Page-object will now have a navigate Method and a route property.:
```ts
export class HomePage {
    route = '/home';
    navigateTo = () => browser.get(this.route);
}
```

__Note:__ The route property is determined by the browsers current route, not from the ```byRoute``` parameter.

## AddFillForm
call the
[```addFillForm```](../api/core/interfaces/ipageobjectinfabrication.html#addfillform)
on a
[IPageObjectInFabrication](../api/core/interfaces/ipageobjectinfabrication.html) to add the ```fillForm``` method.  
The ```fillForm``` method helps you to fill up large forms. It expects an object as parameter, which has a property for each input, to determine the values, which should be send to the input.  
```addFillForm``` also adds a ```clearForm``` method, to remove the content from all these inputs.

#### Example:
```ts
let homePage = await pageObjectBuilder.generate({
    name: 'HomePage',
    byRoute: '/home',
});
homePage = await homePage.addFillForm();
```

the generated Page-object will now have a navigate Method and a route property.:
```ts
export class HomePage {
    route = '/home';
    navigateTo = () => browser.get(this.route);
}
```

## Continue
* [Previous Step - generate page-object through several steps or compose through several steps](./append.md)
* [Next Step - Custom Snippets](./custom-snipptes.md)
