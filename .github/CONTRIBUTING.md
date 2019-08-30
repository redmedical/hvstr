# How to contribute to hvstr

## Have you found a bug or have a problem?
* __Ensure the bug was not already reported__, by searching on GitHub under Issues.
    * Take part of the discussion
* If you're unable to find an open issue addressing the problem, open a new one. Be sure to include a title and clear description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring. __Use the bug Template__

## Do you intend to add a new feature or change an existing one?
* __Ensure the feature is not already a listed as a Github issue__


## Have you written a patch that fixes a bug or implemented a new feature?
* Open a new GitHub pull request with the patch.
* Ensure the PR description clearly describes the problem and solution. Include the relevant issue number if applicable.

### Format of the commit messages
* see [format of the commit message](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines)
* use one of the following scopes:
    * core - for changes at the core module
    * client - for changes at the client module
    * shared - for changes at the shared module
    * config - for changes at configuration files
    * \* - for other changes

## How To - Develop

### Setup dev environment

You will need to have the following tools installed.:
* [GIT](https://git-scm.com/)
* [Node and Npm](https://nodejs.org/en/)

We recommend that you use [Visual Studio Code](https://code.visualstudio.com/) as IDE.

#### Clone repository and install dependencies

run
```
$ git clone https://github.com/redmedical/hvstr.git
```
to clone hvstr on your machine.

Now you need to install all npm packages. Hvstr consists of 3 components:
* core
* client
* utils
You will need to install the dependencies for each. Run:
```
$ cd utils
$ npm install
$ cd ../client
$ npm install
$ cd ../core
```

#### Use local version of hvstr-utils
If you make any changes at the hvstr-utils component and want to use it in the core or client you can install it locally.

First you need to build the utils package.
```
$ cd utils
$ npm run build
```
afterwards you can switch to the core or client directory and install the build locally.:
```
$ cd ../core
$ npm install ../utils --no-save
```
> make sure, no changes affecting the `package.json` are committed.

#### Build the project and run tests

To build all components, you will need to run ```npm run build``` in each component. Each component contains the npm scripts to ```build``` and ```lint```. Currently just the core contains tests. You can run them with ```npm run test```.

#### Debug the project.
The easiest way to debug hvstr, is to install it in a test project and use the debugging tools of the test project. If you want to debug the unit tests you can use this manual.:  
[Node.js debugging in VS Code](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)

> You can always use classic javascript debugging with ```console.log();```. Just make sure, to remove all logs, before you contribute.
