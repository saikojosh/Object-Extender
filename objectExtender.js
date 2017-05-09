'use strict';

/*
 * OBJECT EXTENDER
 * A set of simple utilities for copying, merging and manipulating plain objects.
 */

const objectAssignDeep = require(`object-assign-deep`);

/*
 * Removes null and undefined values if the relevant options are set. Mutates the object passed in.
 */
function removeUndesirableProperties (object, options) {

	const { ignoreNull, ignoreUndefined } = options;

	// Nothing to ignore, nothing to do!
	if (!ignoreNull && !ignoreUndefined) { return object; }

	// Enumerate all the properties.
	for (const key in object) {
		if (!object.hasOwnProperty(key)) { continue; }

		// Step down into nested objects and tide those too.
		if (typeof object[key] === `object` && !Array.isArray(object[key])) {
			removeUndesirableProperties(object[key], options);
		}

		// Remove unwanted properties.
		else if ((typeof object[key] === `undefined` && ignoreUndefined) || (object[key] === null && ignoreNull)) {
			delete object[key];
		}

	}

}

/*
 * Takes an array of objects to merge and some optional configurable options.
 */
function extend (_objects, _options = {}) {

	const options = defaults({
		ignoreNull: true,
		ignoreUndefined: true,
		arrayBehaviour: `replace`,
	}, _options);

	const target = {};
	const objects = [];

	// Optionally remove null and undefined values from all objects, excluding null values in the very first object.
	for (let index = 0; index < _objects.length; index++) {
		const useOptions = (index === 0 ? defaults(options, { ignoreNull: false }) : options);
		const clonedObject = clone(_objects[index]);
		objects.push(removeUndesirableProperties(clonedObject, useOptions));
	}

	// Perform the merge.
	return objectAssignDeep.withOptions(target, objects, { arrayBehaviour: options.arrayBehaviour });

}

/*
 * Returns a new deep merge of all the given objects with all references broken and without mutating any of the objects.
 */
function merge (...objects) {
	return objectAssignDeep.noMutate(...objects);
}

/*
 * Merges the given objects into the target (first parameter) object, mutating the target object.
 */
function mergeInto (target, ...objects) {
	return objectAssignDeep(target, ...objects);
}

/*
 * Returns a new deep copy of the given object with all references broken.
 */
function clone (object) {
	return objectAssignDeep.noMutate(object);
}

/*
 * A useful method for passing lots of values into a function which need default values, and optionally some read-only
 * values too.
 *
 * [Param: defaultValues]
 *   An object containing default values.
 *
 * [Param: actualValues]
 *   An object containing the actual values that are being set.
 *
 * [Param: readOnlyValues]
 *   An optional object containing values which should not be changed.
 *
 * [Example]
 *   extender.defaults({
 *     prop1: `Hello`,
 * 		 prop2: `World`,
 *     prop3: `Node`,
 *		 special: null,
 *	 }, {
 *	 	 prop1: `Josh`,
 *		 prop2: `Cole`,
 *     special: false,
 *	 }, {
 *	   special: true,
 *	 });
 *
 * [Expected Output]
 *   {
 *     prop1: `Josh`,
 *     prop2: `Cole`,
 *     prop3: `Node`,
 *     special: true,
 *   }
 */
function defaults (defaultValues, actualValues, readOnlyValues = {}) {
	return objectAssignDeep.noMutate(defaultValues, actualValues, readOnlyValues);
}

/*
 * Export.
 */
module.exports = {
	extend,
	merge,
	mergeInto,
	mixin: mergeInto,
	clone,
	copy: clone,
	defaults,
};
