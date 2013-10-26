
var bind = (function () {
    "use strict";

    var bind = function (fun, scope) {
        return function () {
            return fun.apply(scope, arguments);
        };
    };

    if (!Function.prototype.bind) {
        Function.prototype.bind = function (scope) {
            return bind(this, scope);
        };
    }

    return bind;
}());
