
var Observer = (function () {
    "use strict";

    var api = {};

    var validateArgs = function (object, methodName, callback) {
        if (!object) {
            throw new Error("Argument object is mandatory.");
        }

        if (!methodName) {
            throw new error("Argument methodName is mandatory.");
        }

        if (!callback) {
            throw new error("Argument callback is mandatory.");
        }
    };

    var getObservedMethod = function (observed, methodName) {
        var method = observed[methodName];
        if (!method) {
            throw new Error("Method " + methodName + " does not exist in object "
                    + object + " and cannot be observed.");
        }

        return method;
    };

    var createProxyMethod = function (method, observers) {
        return function () {
            var result = method.apply(this, arguments);

            var len = observers.length;
            for (var i = 0; i < len; ++i) {
                observers[i].apply(this, arguments);
            }

            return result;
        };
    };

    var restoreRealMethod = function (object, methodName) {
        var observed = object.prototype || object;
        var method = observed[methodName];
        var realMethod = method.__realMethod;
        if (realMethod) {
            observed[methodName] = realMethod;
            return true;
        }

        return false;
    };

    api.observe = function (object, methodName, callback) {
        validateArgs(object, methodName, callback);
        var observed = object.prototype || object;
        var method = getObservedMethod(observed, methodName);

        var proxyMethod = method;
        if (!proxyMethod.__observers) {
            var observers = [];
            proxyMethod = createProxyMethod(method, observers);
            proxyMethod.__observers = observers;
            proxyMethod.__realMethod = method;
            observed[methodName] = proxyMethod;
        }

        proxyMethod.__observers.push(callback);
        return callback;
    };

    api.unobserve = function (object, methodName, callback) {
        validateArgs(object, methodName, callback);
        var observed = object.prototype || object;
        var method = getObservedMethod(observed, methodName);

        var observers = method.__observers;
        if (observers) {
            var index = observers.indexOf(callback);
            if (index > -1) {
                observers.splice(index, 1);
                if (observers.length === 0) {
                    restoreRealMethod(object, methodName);
                }

                return true;
            }
        }

        return false;
    };

    api.unobserveAll = function (object, methodName) {
        if (!object) {
            throw new Error("Argument object is mandatory.");
        }

        if (!methodName) {
            throw new error("Argument methodName is mandatory.");
        }

        return restoreRealMethod(object, methodName);
    };

    var resolveCallback = function (instance, methodName, callback) {
        var callbackType = typeof callback;
        if (callbackType === "function") {
            return callback;
        } else if (callbackType === "string") {
            return object[callback];
        } else if (callbackType === "undefined" && typeof this[methodName] === "function") {
            return this[methodName];
        } else {
            throw new Error("Incorrect callback: " + callback);
        }
    };

    var instancedObserve = function (object, methodName, callback) {
        var resolvedCallback = resolveCallback(this, methodName, callback);
        var boundCallback = bind(resolvedCallback, this);
        boundCallback.__observerId = resolvedCallback;

        if (!this.__observerCallbacks) {
            this.__observerCallbacks = [];
        }

        this.__observerCallbacks.push(boundCallback);

        api.observe(object, methodName, boundCallback);
    };

    var instancedUnobserve = function (object, methodName, callback) {
        var callbacks = this.__observerCallbacks;
        if (callbacks) {
            var resolvedCallback = resolveCallback(this, methodName, callback);
            var len = callbacks.length;
            var boundCallback;
            var i;
            for (i = 0; i < len; ++i) {
                boundCallback = callbacks[i];
                if (boundCallback.__observerId === callback) {
                    break;
                }
            }

            callbacks.splice(i, 1);

            return api.unobserve(object, methodName, boundCallback);
        }

        return false;
    };

    api.applyToObject = function (object) {
        object.observe = instancedObserve;
    };

    return api;
}());
