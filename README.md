Object Extender
===============

An attempt at making it easy to extend, copy and merge objects. There are numerous pitfalls to using this module and it will not work as expected in many cases - please test your code thoughroughly.

Read the source code for the methods and how to use them.

## Known Issues

- **Breaking references doesn't work with "deep" objects** - References can be broken at the top level only. This is a known issue with the code in `deepExtend()`.