# hvstr

hvstr is an open source page object generator for [protractor](http://protractortest.org/). With hvstr, you'll never have to write annoying page objects again. Just place some `e2e` attributes in your project, tell hvstr how to reach your page and it will generate the page objects for you.


## Quick Start

1. Install

    ###### Install from NPM: 
    ```
    > npm install --save @redmedical/hvstr-client
    > npm install --save-dev @redmedical/hvstr-core ts-node
    ```

2. Initialize the `IdCollector` in your apps main file:  
    ###### in main.ts:
    ```
    import { IdCollector } from '@redmedical/hvstr-client';

    if (!environment.production) {
        IdCollector.init();
    }
    ```

3. Add the ID collector:  
    Copy the [e2e-id directive](./samples/quickstart/e2e-id.directive.ts) in to your own project and declare it.

    ###### in NgModules:
    ```
    @NgModule({
      <...>
      declarations: [
        E2eIdDirective,
        <...>
      ],
    })
    ```
    And adapt the path to your environment config in the directive.

4. Add npm script and hvstr config: 

    Create a hvstr config file from the [example](./samples/quickstart/hvstr.conf.js).  
    Now you can add a npm script, to generate your page object:

###### In package.json:
```
{
  "scripts": {
    "hvstr": "node ./node_modules/protractor/bin/protractor ./hvstr.conf.js",
    <...>
  }
}
```

5. Now you can add your hvstr script, to generate your page objects:

    Use the [Example](./samples/quickstart/main.hvstr.ts) and begin to generate your page objects.

    ### Add your first page object
    First of all you need to mark every element/component in your application, which should be added to the page object. You can do this by tagging these elements with our (in step 3) created IDCollector directive:

    ###### for example in app.component.html:
    ```
    <h1 e2e="title">My App</h1>
    <app-some-component e2e="component">
    <footer e2e="page-footer">...</footer>
    ```

    Now we can instruct hvstr to generate the page object with the simple call:

###### in main.hvstr.ts:
```
  let startPage = await pageObjectBuilder.generate({
    name: 'HomePage',
    byRoute: '/home',
  });
```

6. Run:

Serve your application (```npm start``` or ```ng serve```)
Finally you can run the npm script ```npm run hvstr``` and hvstr will generate your page objects.

## Continue
[Next Step - Array-like recurring elements](./docs/guide/array.md)

## Feedback

* create an issue on [GitHub](https://github.com/redmedical/hvstr/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request+sort%3Areactions-%2B1-desc)

## Contributing

Take a look at our [contributing guidelines](./.github/CONTRIBUTING.md)

## Documentation

See [GitHub wiki](https://github.com/redmedical/hvstr/wiki)


## License

Copyright (c) RED Medical Systems GmbH. All rights reserved.  
Licensed under the Apache-2.0 License.
