# Array-like recurring elements
Sometimes it is necessary, to have repeated elements. For example, when you have lists or tables. Therefore, you can tell hvstr that an element can be or is recurring. Just put some 'Array' braces (```[]```) at the end of the if from the recurring element.

## Example
```html
<ul>
    <li *ngFor="let element of list">
        {{element}}
    </li>
</ul>
```
In this example a list is generated from the ```list``` array. Now we add an array-like e2e id to the ```li``` element.:
```html
<ul>
    <li *ngFor="let element of list" e2e="list-item[]">
        {{element}}
    </li>
</ul>
```

Now after generating the page-object an element get function will be in the page-object, which returns an [```ElementArrayFinder```](http://www.protractortest.org/#/api?view=ElementArrayFinder).:

```ts
getListItem(): ElementArrayFinder {
    return element.all(by.css('.e2e-list-item'));
}
```

## Child elements from array-likes
In the Dom, subordinated elements, from a recurring element don't need to be tagged as recurring elements. hvstr will detect, that these elements can recur as a child from array-likes and will add an index parameter to the element get function.

```html
<ul>
    <li *ngFor="let element of list" e2e="list-item[]">
        <span e2e="list-item-label">
            {{element}}
        </span>
    </li>
</ul>
```
In this example, hvstr will generate an element get function with an index parameter for the list-item-label.:

```ts
getListItem(): ElementArrayFinder {
    return element.all(by.css('.e2e-list-item'));
}

getListItemLabel(listItemIndex: number): ElementFinder {
    return this.getListItem().get(listItemIndex).element(by.css('.e2e-list-item-label'));
}
```

## Recurring elements on several levels
hvstr supports multiple layers of recurring elements. For example, a table has it's rows as a level of recurring elements and it's columns. In this case, you have to tag each layer of recurring elements as an array-like. For each layer child element get functions will get a new parameter, to select the index of the recurring element.

```html
<table>
    <tr *ngFor="let row of rows" e2e="table-rows[]">
        <td *ngFor="let col of rows.cols" e2e="table-cols[]">
            <span e2e="table-label">
                {{col.text}}
            </span>
        </td>
    </tr>
</table>
```
In this example, a table, with multiple rows and cols, each having a label, are present. The page-object will contain the following functions.:

```ts
getTableRows(): ElementArrayFinder {
    return element.all(by.css('.e2e-table-rows'));
}

getTableCols(tableRowsIndex: number): ElementArrayFinder {
    return this.getTableRows().get(tableRowsIndex).all(by.css('.e2e-table-cols'));
}
getListItemLabel(tableRowsIndex: number, tableColsIndex: number): ElementFinder {
    return this.getTableCols(tableRowsIndex).get(tableColsIndex).element(by.css('.e2e-table-label'));
}

```


## Continue
* [Previous Step - Quick Start](../../readme.md#quickstart)
* [Next Step - generate page-object through several steps or compose through several steps](./append.md)
