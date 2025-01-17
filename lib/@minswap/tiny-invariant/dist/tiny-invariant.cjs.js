'use strict';

var prefix = 'Invariant failed';
function invariant(condition, message) {
    if (condition) {
        return;
    }
    var provided = typeof message === 'function' ? message() : message;
    var value = provided ? prefix + ": " + provided : prefix;
    throw new Error(value);
}

module.exports = invariant;
