

var print = function (msg) {
    document.getElementById("out").innerHTML += (msg || "").toString();
};

var println = function (msg) {
    print((msg || "") + "<br />");
};

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
    };

    var superCall = function (methodName, args) {
        var realSuper = this.__super;
        var superMethod = realSuper.prototype[methodName];
        if (!superMethod) {
            throw new Error("Object of class " + this.getClass().name + " attempted to call super-class method "
                + methodName + ". Such method does not exist in " + superClass.name + " class.");
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

    var createConstructor = function (className, init) {
        var classDefiner = new Function("init", "return function " + className
                + "() { init.apply(this, arguments); };");
        return classDefiner(init);
    };

    var applyAuxiliaryProperties = function (newPrototype, newClass, superClass) {
        newPrototype.__class = newClass;
        newPrototype.__super = newClass.superClass;
        newPrototype.superInit = superInit;
        newPrototype.superCall = superCall;
        newPrototype.getClass = getClass;
    };

    var inheritPrototype = function (newClass, newPrototype, superClass) {
        // Setup the prototype.
        inheritProperties(newPrototype, superClass.prototype);
        applyAuxiliaryProperties(newPrototype, newClass, superClass);

        // Get rid of the init method from the pototype - it should never be called directly.
        delete newPrototype.init;
        newClass.prototype = newPrototype;
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
            var newClass = createConstructor(className, newPrototype.init);
            newClass.superClass = superClass;

            inheritPrototype(newClass, newPrototype, superClass);

            return newClass;
        }
    };
}());

var test1 = function () {
    println("Hello World!");

    var SuperClass = Class.define("SuperClass", {
        init: function () {
            this.superTest = " from super class";
            println("SuperClass.init");
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
            println("MyClass.init");
        },

        superMethod: function () {
            println("trolol bwaha");
            this.superCall("superMethod", arguments);
        }
    });

    var FromRaw = Class.define("FromRaw", RawClass, {
        doRaw: function () {
            this.superCall("doRaw", arguments);

            println("addition to raw");
        }
    });

    var raw = new FromRaw();
    println(raw.prop);
    raw.doRaw();

    var NextLayer = Class.define("NextLayer", MyClass, {
        init: function () {
            this.superInit(arguments);
            println("NextLayer.init");
        },

        superMethod: function () {
            println("Still works");
        }
    });

    var obj = new NextLayer();
    println("This is " + obj.test);
    println("This is " + obj.superTest);

    obj.superMethod();
};

var test2 = function () {
    var Base = Class.define("Base", {
        init: function () {
            this.superInit();
            println("Base.init");
        },

        foo: function () {
            println("Base.foo: " + this.getClass().name);
        }
    });

    var Child = Class.define("Child", Base, {
        init: function () {
            this.superInit();
            println("Child.init");
        },

        foo: function () {
            println("Child.foo: " + this.getClass().name);
        }
    });

    var GrandChild = Class.define("GrandChild", Child, {
        init: function () {
            this.superInit();
            println("GrandChild.init");
        },

        foo: function () {
            println("GrandChild.foo: " + this.getClass().name);
        }
    });

    new GrandChild();
};

var main = function () {
    test2();
};
