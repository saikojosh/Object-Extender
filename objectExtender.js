var ME   = module.exports;
var util = require('util');
var _    = require('underscore');

/*
 * Extend the first object with subsequent objects. Specify true as the first
 * param for deep extend. This method will overwrite the first object. Nulls and
 * undefineds in source objects will be ignored.
 * [Usage]
 *  <1> extender.extend({}, {}, {}...);
 *  <2> extender.extend(true, {}, {});
 */
ME.extend = function () {

  var args       = _.toArray(arguments);
  var deepExtend = false;

  if (typeof args[0] === 'boolean') {
    deepExtend = args[0];
    args.splice(0, 1);
  }

  return ME.smartExtend({
    objects:         args,
    deep:            deepExtend,
    ignoreNull:      true,
    ignoreUndefined: true,
    unref:           true
  });

};

/*
 * Merges all the given objects into the return value, without breaking
 * references or overwriting the original object. Nulls and undefineds in source
 * objects will also be merged in.
 * [Usage]
 *  var newObject = extender.merge({}, {}, {});
 */
ME.merge = function () {

  var args = _.toArray(arguments);

  return ME.smartExtend({
    objects:         args,
    deep:            true,
    ignoreNull:      false,
    ignoreUndefined: false,
    unref:           false
  });

};

/*
 * Convenience method for creating a new copy of an object. This will copy the
 * object as-is, including nulls and undefinds, it will also break references so
 * it's a clean copy.
 * [Usage]
 *  var newObject = extender.copy({});
 */
ME.copy = function (object) {

  return ME.smartExtend({
    objects:         [object],
    deep:            true,
    ignoreNull:      false,
    ignoreUndefined: false,
    unref:           true
  });

};

/*
 * Convenience method for specifying default values for object properties.
 * Useful when passing a lot of parameters into a function. The third parameter
 * 'readOnlyOptions' is optional and allows you to specify values which can not
 * be overwritten by the consumer of the function, but which you want to appear
 * in the options hash.
 * [Usage]
 *  function myFunc (options) {
 *    options = extender.defaults({ a: 1, b: 2 }, options);
 *    options = extender.defaults({ a: 1, b: 2 }, options, readOnlyOptions);
 *  };
 */
ME.defaults = function (defaults, values, readOnlyValues) {
  readOnlyValues = readOnlyValues || {};

  return ME.smartExtend({
    objects:         [defaults, values, readOnlyValues],
    deep:            true,
    ignoreNull:      false,
    ignoreUndefined: true,
    unref:           true
  });

};

/*
 * Extend objects with additional options.
 */
ME.smartExtend = function (options) {

  var startIndex = 1;

  options = _.extend({
    objects:        [],      // An array of objects for extending.
    deep:            false,  // Set to true to extend the objects at multiple depths recursively.
    ignoreNull:      true,   // Set to false to allow null values in later objects to overwrite the initial values.
    ignoreUndefined: true,   // Set to false to allow undefined values in later objects to overwrite the initial values.
    unref:           true    // Set to true to create a new object rather than modifying the original object (by reference).
  }, options);

  // Push an empty object onto the front of the array to prevent the original
  // object from being modified.
  if (options.unref) {
    options.objects.unshift({});
    startIndex = 2;  // don't strip null values from the first 2 objects.
  }

  // Remove any nulls and undefineds from each object, not including the first
  // object. Nulls are only removed if we are ignoring null values.
  for (var o = startIndex, olen = options.objects.length; o < olen; o++) {
    for (var p in options.objects[o]) {
      if (options.objects[o].hasOwnProperty(p)) {

        // Remove unwanted properties.
        if (
          (typeof options.objects[o][p] === 'undefined' && options.ignoreUndefined) ||
          (options.objects[o][p] === null && options.ignoreNull)
        ) {
          delete options.objects[o][p];
        }

      }
    }
  }

  return (options.deep ? ME.deepExtend.apply(null, options.objects) : _.extend.apply(null, options.objects));

};

/*
 * Recursively extends an object with subsequent objects. VERY BASIC.
 * [Usage]
 *  <1> extender.deepExtend({ level2: {} }, { level2: {} }...);
 */
ME.deepExtend = function() {

  // Create an array from the arguments and break references to prevent memory leaks.
  var args = _.toArray(arguments);
  args = args.splice(0, args.length);

  // Remove the first argument and store it
  var original = args.splice(0, 1)[0];

  // Cycle remaining arguments
  for (var a in args) {

    // Cycle argument properties
    for (var p in args[a]) {
      if (args[a].hasOwnProperty(p)) {

        // New argument property is an object
        if (ME.isTrueObject(args[a][p])) {

          // Original property is also an object, Recurse down to the next level
          if (ME.isTrueObject(original[p])) {
            original[p] = ME.deepExtend(original[p], args[a][p]);
          }

          // Original property is not an object
          else {
            original[p] = args[a][p];
          }

        }

        // Other type
        else {
          original[p] = args[a][p];
        }

      }
    }

  }

  // We have updated the original object with the values from the subsequent
  // objects and broken the reference to the originals, so it's safe to return.
  return original;

};

/*
 * Returns true if the input is a true object and not an array or function.
 */
ME.isTrueObject = function (input) {
  return (_.isObject(input) && !_.isArray(input) && !_.isFunction(input));
};

/*
 * Used to instantiate a constructor, and inherit the base class if specified.
 *
 * [Usage: Extending a base class]
 *  var MyChildClass = extender.constructor(BaseClass,
 *    function MyChildClass () {
 *      BaseClass.apply(this, arguments);
 *      ...
 *    }
 *  );
 *  MyChildClass.prototype.myFunc = function () {
 *    this.myFunc.apply(this, arguments);
 *    ...
 *  };
 *
 * [Usage: Creating a base class]
 *  var MyBaseClass = extender.constructor(
 *    function MyBaseClass (a, b, n...) {
 *      ...
 *    }
 *  );
 *  MyBaseClass.prototype.myFunc = function () {};
 */
ME.constructor = function (parent, child) {

  // Creating a constructor without a base class
  // extender.constructor(function ChildClass () {});
  if (!_.isFunction(child)) { return parent; }

  // Creating a constructor by extending a base class
  // extender.constructor(BaseClass, function ChildClass () {});
  util.inherits(child, parent);
  return child;

};