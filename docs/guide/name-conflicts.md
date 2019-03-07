# Name Conflicts
If you are reusing components more than just once on a page, the chances are high that two elements have the same e2e-id. Therefor hvstr has a strategy to resolve these Issues. This page explains how:

Through the DOM all elements have a logical tree structure.
First of all, this tree gets proceeded reclusively and all e2e-id's get stored in a binomial tree. This tree detects all names, a name-conflict exists for and stores these conflicts, with all its elements in a list.
Afterwards, for each pair of conflicting elements, the path (in the element tree) gets evaluated, where they divagate. This steps are getting flagged.

```
 R
/ \
A  B
|  |
C  C
```
In this example, the two C's are the name-conflict. The path to the first is ```R->A->C``` and to the second ```R->B->C```. The two paths are diverge at ```A``` and ```B```.

In the end a new 'conflict free' name is generated, by putting all flagged element id's together.
This would be ```AC``` and ```BC``` in the last example.

This works as well with more conflicts:

```
   R
 / | \
A  B  D
|  |  |
C  C  C
```
here we would have the paths:
```
R->A->C
   ^
R->B->C
   ^
R->D->C
   ^
```
So the names would be:
```
AC
BC
DC
```


More complex cases:
### 1.
```
   R
 / | \
A  B  D
|  |  |
C  E  F
  / \ |
 C  G C
```
```
R->A->C
   ^
R->B->E->C
   ^
R->D->F->C
   ^
```
```
AC
BC
DC
```
### 2.
```
   R
 / |
A  B
|  | \
C  E  D
  / \ |
 C  G C
```
```
R->A->C
   ^
R->B->E->C
   ^  ^
R->B->D->C
   ^  ^
```
```
AC
BEC
BDC
```
### 3.
```
  R
 / \
C   A
    |
    C
```
```
R->C
   ^
R->A->C
   ^
```
```
C
AC
```

## Exceptions and Undefined behavior

When two conflicts are in a parent child relation, an exception is thrown.:

```
  C
  |
[...]
  |
  C
```
```
C
^
C->...->C
^
```
throws an exception.

When two elements are on the same level and not marked as array-like elements, the behavior is undefined.

## Continue
* [Previous Step - Custom Snippets](./custom-snipptes.md)
