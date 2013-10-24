

var print = function (msg) {
    document.getElementById("out").innerHTML += (msg || "").toString();
};

var println = function (msg) {
    print((msg || "") + "<br />");
};

var Class = (function () {
    "use strict";

    var emptyFunc = function () { };

    var applyProps = function (from, to) {
        for (var prop in from) {
            if (from.hasOwnProperty(prop) && !to.hasOwnProperty(prop)) {
                to[prop] = from[prop];
            }
        }
    };

    var superInit = function (args) {
        this.__super.init.apply(this, args);
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

    var createConstructor = function (className, superClass) {
        var classDefiner = new Function("return function " + className
                + "() { this.init.apply(this, arguments); };");
        var newClass = classDefiner();
        newClass.superClass = superClass;
        return newClass;
    };

    var getPrototype = function (newClass, newPrototype, superClass) {
        var superPrototype = superClass.prototype;
        applyProps(superPrototype, newPrototype);

        newPrototype.__class = newClass;
        newPrototype.__super = superPrototype;
        newPrototype.superInit = superInit;
        newPrototype.superCall = superCall;
        newPrototype.getClass = getClass;

        return newPrototype;
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
                    throw new Error("Unexpected argument number - expected either 2 or 3 arguments");
            }

            // Setup default argument values.
            if (!className) {
                throw new Error("Class must have a name!");
            }

            superClass || (superClass = Object);
            newPrototype || (newPrototype = {});
            newPrototype.init || (newPrototype.init = emptyFunc);

            // Begin actual class definition creation.
            var newClass = createConstructor(className, superClass);
            newClass.prototype = getPrototype(newClass, newPrototype, superClass);

            return newClass;
        }
    };
}());

var main = function () {
    println("Hello World!");

    //var MyClass = Class.define("MyClass", BaseClass, {});

    var SuperClass = Class.define("SuperClass", {
        init: function () {
            this.superTest = " from super class";
        },

        superMethod: function () {
            println("tralala");
        }
    });

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

};
