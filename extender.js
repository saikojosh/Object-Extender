var ME   = module.exports
  , util = require('util')
  , _    = require('underscore');

/*
 * Extend the first object with subsequent objects. Specify true as the first
 * param for deep extend.
 * [Usage]
 *  <1> extend({}, {}, {}...)
 *  <2> extend(true, {}, {})
 */
ME.extend = function () {

  var args       = _.toArray(arguments)
    , deepExtend = false;

  if (typeof args[0] === 'boolean') {
    deepExtend = args[0];
    args.splice(0, 1);
  }

  return ME.extendSmart({
      objects: args
    , deep:    deepExtend
  });

};

/*
 * Merges subsequent objects into the first object, without breaking references
 * or overwriting the original object.
 * [Usage]
 *  merge({}, {}, {})
 */
ME.merge = function () {

  var args = _.toArray(arguments);

  return ME.extendSmart({
      objects:    args
    , deep:       false
    , ignoreNull: false
    , unref:      false
  });

};

/*
 * Extend objects with additional options.
 */
ME.extendSmart = function (options) {

  var startIndex = 1;

  options = _.extend({
      objects:        []     // an array of objects for extending.
    , deep:           false  // true extends on multiple levels.
    , ignoreNull:     true   // false allows null values in later objects to overwrite the initial values.
    , unref:          true   // true creates a new object rather than modifying the original object (by reference).
  }, options);

  // Push an empty object onto the front of the array to prevent the original
  // object from being modified.
  if (options.unref) {
    options.objects.unshift({});
    startIndex = 2;  // don't strip null values from the first 2 objects.
  }

  // Remove any null from each object, not including the first object.
  if (options.ignoreNull) {
    for (var o = startIndex, olen = options.objects.length; o < olen; o++) {
      for (var p in options.objects[o]) {
        if (options.objects[o].hasOwnProperty(p)) {
          if (options.objects[o][p] === null) delete options.objects[o][p];
        }
      }
    }
  }

  return (options.deep ? ME.extendDeep.apply(null, options.objects) : _.extend.apply(null, options.objects));

};

/*
 * Recursively extends an object with subsequent objects. VERY BASIC.
 * [Usage]
 *  <1> extendDeep({}, {}...)
 */
ME.extendDeep = function() {

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
            original[p] = ME.extendDeep(original[p], args[a][p]);
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
  if (!_.isFunction(child)) return parent;

  // Creating a constructor by extending a base class
  // extender.constructor(BaseClass, function ChildClass () {});
  util.inherits(child, parent);
  return child;

};