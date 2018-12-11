# HVSTR

HVSTR is an open source page-object generator for [protractor](http://protractortest.org/). With HVSTR, you never will have to write annoying page-objects. Just place some id tags in your project and tell HVSTR, how to reach your page and your it will generate the page-objects for you.


## Quick Start

1. Install

###### Install from NPM: 
```
> npm install --save @redmedical/HVSTR-client
> npm install --save-dev @redmedical/HVSTR-core ts-node
```

2. Initialize the IdCollector in your apps main file:  
###### in main.ts:
```
import * as PageObjectGeneratorClient from '@redmedical/HVSTR-client';

if (!environment.production) {
 PageObjectGeneratorClient.IdCollector.init();
}
```

3. Add the ID collector:  
Copy the [e2e-id directive](./samples/quickstart/e2e-id.directive.ts) in your project and add declare it.

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
And adapt the path to your environment.

4. Add npm script and HVSTR config: 

Create a hvstr config file ([example](./samples/quickstart/hvstr.conf.js) more in the [GitHub wiki](https://github.com/redmedical/HVSTR/wiki)).  
Now you can add a npm script, to generate your page-object.:

###### In package.json:
```
{
  "scripts": {
    "hvstr": "ng e2e --config ./hvstr.conf.js",
    <...>
  }
}
```

5. Now you can add your HVSTR script, to generate your page-objects.:

Use the [Example](./samples/quickstart/main.hvstr.ts) and begin to generate your page-objects.

### Add your first page-object
first of all you need to mark every element/component in your application, which should be added to the page-object. You can do this by tagging these elements with our (in step 3) created IDCollector directive.:

###### for example in app.component.html:
```
<h1 e2e="title">My App</h1>
<app-some-component e2e="component">
<footer e2e="page-footer">...</footer>
```

Now we can instruct HVSTR to generate the page object with the simple call:

###### in main.hvstr.ts:
```
  let startPage = await pageObjectBuilder.generate({
    name: 'HomePage',
    byRoute: '/home',
  })
```

Finally you can run the npm script ```npm run hvstr``` and HVSTR will generate your page-objects.

## Feedback

* create an issue on [GitHub](https://github.com/redmedical/hvstr/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request+sort%3Areactions-%2B1-desc)

## Contributing

Take a look at our [contributing guidelines](./.github/CONTRIBUTING.md)

## Documentation

See [GitHub wiki](https://github.com/redmedical/HVSTR/wiki)


## License

Copyright (c) Red Medical Systems GmbH. All rights reserved.  
Licensed under the Apache-2.0 License.
