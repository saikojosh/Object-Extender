# Object-Extender
A set of simple utilities for copying, merging and manipulating plain objects.

## Caution! Danger of Death!
This module is built upon the [Object-Assign-Deep](https://www.npmjs.com/package/object-assign-deep) module and is subject to the same restrictions. Please see the warning in that project's readme before you use this module. Kittens' lives are at stake!

## Quick Start
All the methods do a deep clone of objects and break references, except where specified.

```javascript
const extender = require(`object-extender`);

// Merging objects without mutating any of them.
const mergedObjects = extender.merge(object1, object2, ...objectN);

// Merging objects into a target object (mutates the target).
extender.mergeInto(target, object1, object2, ...objectN);
extender.mixin(target, object1, object2, ...objectN);  // Alias of mergeInto()

// Clone a single object.
const clonedObject = extender.clone(originalObject);
const clonedObject = extender.copy(originalObject);  // Alias of clone()
```

## Custom Behaviour
You can use the `.extend()` method to customise the behaviour of the module.

### Ignoring Null or Undefined Values
You can optionally ignore `null` and `undefined` values in all but the first object by using the .extend() method. This allows you to avoid `null` or `undefined` values in object2 (or later) from overwriting valid values that exist in earlier objects. Simply pass in the `ignoreNull` or `ignoreUndefined` options.

**Example:**
```javascript
const mergedObjects = extender.extend([
	{ prop1: `Josh`, prop2: `Cole`, },
	{ prop1: null, prop2: undefined, prop3: `Node` },
], {
	ignoreNull: true,
	ignoreUndefined: true,
});
```

**Expected Output:**
```javascript
{
	prop1: `Josh`,
	prop2: `Cole`,
	prop3: `Node`,
}
```

### Merging Arrays
By default, arrays are overwritten by later values so if you had two objects both with an `array1` property, the array in the latter object would win out:

```javascript
// Merging these two objects...
{ array1: [1, 2, 4] }
{ array1: [5, 6, 7] }

// ...would by default result in:
{ array1: [5, 6, 7] }
```

You can instead choose to merge the arrays by passing in the `arrayBehaviour` option and setting it to "merge":

**Example:**
```javascript
const mergedObjects = extender.extend([
	{ array1: [1, 2, 4] },
	{ array1: [5, 6, 7] },
], {
	arrayBehaviour: `merge`,
});
```

**Expected Output:**
```javascript
{
	array1: [1, 2, 4, 5, 6, 7],
}
```

## Default Values
A useful method for passing lots of values into a function which need default values, and optionally some read-only values too.

**Parameters:**
* `defaultValues` - An object containing default values.
* `actualValues` - An object containing the actual values that are being set.
* `readOnlyValues` - An optional object containing values which should not be changed.

**Example:**
```javascript
extender.defaults({
	prop1: `Hello`,
	prop2: `World`,
	prop3: `Node`,
	special: null,
}, {
	prop1: `Josh`,
	prop2: `Cole`,
	special: false,
}, {
	special: true,
});
```

**Expected Output:**
```javascript
{
	prop1: `Josh`,
	prop2: `Cole`,
	prop3: `Node`,
	special: true,
}
```
