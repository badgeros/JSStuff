

var print = function (msg) {
    document.getElementById("out").innerHTML += (msg || "").toString();
};

var println = function (msg) {
    print((msg || "") + "<br />");
};

var Class = (function () {
    "use strict";

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

    var superInit = function (args) {
        var init = this.__super.init;
        if (init) {
            init.apply(this, args);
        } else {
            this.__class.superClass.apply(this, args);
        }
    };

    var superCall = function (methodName, args) {
        var superMethod = this.__super[methodName];
        if (!superMethod) {
            throw new Error("Object of class " + this.getClass().name + " attempted to call super-class method "
                + methodName + ". Such method does not exist in " + this.getClass().superClass.name + " class.");
        }

        superMethod.apply(this, args);
    };

    var getClass = function () {
        return this.__class;
    };

    var createConstructor = function (className) {
        var classDefiner = new Function("return function " + className
                + "() { this.init.apply(this, arguments); };");
        return classDefiner();
    };

    var applyAuxiliaryProperties = function (newPrototype, newClass) {
        newPrototype.__class = newClass;
        newPrototype.__super = newClass.superClass.prototype;
        newPrototype.superInit = superInit;
        newPrototype.superCall = superCall;
        newPrototype.getClass = getClass;
    };

    return {
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
            var newClass = createConstructor(className);
            newClass.superClass = superClass;

            // Setup the prototype.
            inheritProperties(newPrototype, superClass.prototype);
            applyAuxiliaryProperties(newPrototype, newClass);
            newClass.prototype = newPrototype;

            return newClass;
        }
    };
}());

var main = function () {
    println("Hello World!");

    var SuperClass = Class.define("SuperClass", {
        init: function () {
            this.superTest = " from super class";
        },

        superMethod: function () {
            println("tralala");
        }
    });

    var RawClass = function RawClass() {
        this.prop = "xxxx";
    };

    RawClass.prototype.doRaw = function () { println("From raw"); };

    var MyClass = Class.define("MyClass", SuperClass, {
        init: function () {
            this.superInit(arguments);
            this.test = " from class";
        },

        superMethod: function () {
            println("trolol bwaha");
            this.superCall("superMethod", arguments);
        }
    });

    var obj = new MyClass();
    println("This is " + obj.test);
    println("This is " + obj.superTest);

    obj.superMethod();

    var FromRaw = Class.define("FromRaw", RawClass, {
        doRaw: function () {
            this.superCall("doRaw", arguments);

            println("addition to raw");
        }
    });

    var raw = new FromRaw();
    println(raw.prop);
    raw.doRaw();
};
