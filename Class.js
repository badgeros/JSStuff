
var Class = (function () {
    "use strict";

    var superInit = function (args) {
        var realSuper = this.__super;
        this.__super = realSuper.superClass;
        try {
            realSuper.apply(this, args);
        } finally {
            this.__super = realSuper;
        }

        if (Class.validatingSuperInitCalls) {
            this.__superInitCalled = true;
        }
    };

    var superCall = function (methodName, args) {
        var realSuper = this.__super;
        var superMethod = realSuper.prototype[methodName];
        if (!superMethod) {
            throw new Error("Object of class " + this.getClass().name + " attempted to call super-class method "
                + methodName + ". Such method does not exist in " + this.__super.name + " class.");
        }

        this.__super = realSuper.superClass;
        try {
            superMethod.apply(this, args);
        } finally {
            this.__super = realSuper;
        }
    };

    var getClass = function () {
        return this.__class;
    };

    var addStatics = function (statics) {
        for (var prop in statics) {
            if (statics.hasOwnProperty(prop)) {
                this[prop] = statics[prop];
            }
        }
    };

    var emptyInit = function () {
        this.superInit(arguments);
    };

    var inheritProperties = function (to, from) {
        for (var prop in from) {
            if (from.hasOwnProperty(prop) && !to.hasOwnProperty(prop)) {
                to[prop] = from[prop];
            }
        }
    };

    var validateInitCall = function () {
        if (!this.__superInitCalled) {
            throw new Error("Method superInit was not called by object of class " + this.getClass().name);
        }

        delete this.__superInitCalled;
    };

    var createConstructor = function (className, init) {
        if (Class.validatingSuperInitCalls) {
            var classDefiner = new Function("init", "validate", "return function " + className
                    + "() { init.apply(this, arguments); validate.apply(this); };");
            return classDefiner(init, validateInitCall);
        } else {
            var classDefiner = new Function("init", "return function " + className
                    + "() { init.apply(this, arguments); };");
            return classDefiner(init);
        }
    };

    var applyAuxiliaryProperties = function (newPrototype, newClass, superClass) {
        newPrototype.__class = newClass;
        newPrototype.__super = newClass.superClass;
        newPrototype.superInit = superInit;
        newPrototype.superCall = superCall;
        newPrototype.getClass = getClass;
    };

    var addAuxiliaryStatics = function (newClass) {
        newClass.addStatics = addStatics;
    };

    var inheritPrototype = function (newClass, newPrototype, superClass) {
        // Setup the prototype.
        inheritProperties(newPrototype, superClass.prototype);
        applyAuxiliaryProperties(newPrototype, newClass, superClass);

        // Get rid of the init method from the pototype - it should never be called directly.
        delete newPrototype.init;
        newClass.prototype = newPrototype;
    };

    var fireSuperClassHooks = function (newClass, superClass) {
        if (superClass.$subClassDefined) {
            superClass.$subClassDefined(newClass);
        }
    };

    return {
        validatingSuperInitCalls: false,

        define: function () {
            // Resolve the varargs.
            var className;
            var superClass;
            var newPrototype;

            switch (arguments.length) {
                case 2:
                    className = arguments[0];
                    superClass = null;
                    newPrototype = arguments[1];
                    break;

                case 3:
                    className = arguments[0];
                    superClass = arguments[1];
                    newPrototype = arguments[2];
                    break;

                default:
                    throw new Error("Unexpected argument number - expected either 2 or 3 arguments"
                           + " - (className, newPrototype) or (className, superClass, newPrototype)");
            }

            // Setup default argument values.
            superClass || (superClass = Object);
            newPrototype || (newPrototype = {});
            newPrototype.init || (newPrototype.init = emptyInit);

            // Do argument validation.
            if (!className) {
                throw new Error("Class must have a name!");
            }

            if (typeof superClass !== "function") {
                throw new Error("Expected superClass to be a function, instead received " + typeof superClass);
            }

            if (typeof newPrototype !== "object") {
                throw new Error("Expected newPrototype to be an object, instead received " + typeof newPrototype);
            }

            // Begin actual class definition creation.
            var newClass = createConstructor(className, newPrototype.init);
            newClass.superClass = superClass;

            addAuxiliaryStatics(newClass);
            inheritPrototype(newClass, newPrototype, superClass);

            fireSuperClassHooks(newClass, superClass);

            return newClass;
        }
    };
}());
