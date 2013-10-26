

var print = function (msg) {
    document.getElementById("out").innerHTML += (msg || "").toString();
};

var println = function (msg) {
    print((msg || "") + "<br />");
};

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
    Class.validatingSuperInitCalls = true;

    var Base = Class.define("Base", {
        init: function () {
            this.superInit(arguments);
            println("Base.init");
        },

        foo: function () {
            println("Base.foo: " + this.getClass().name);
        }
    });

    Base.addStatics({
        $subClassDefined: function (subClass) {
            println("subClass created! Adding extra attr.");
            subClass.prototype.extra = subClass.name;
        }
    });

    var Child = Class.define("Child", Base, {
        init: function () {
            this.superInit(arguments);
            println("Child.init");
        },

        foo: function () {
            this.superCall("foo", arguments);
            println("Child.foo: " + this.getClass().name);
        }
    });

    var GrandChild = Class.define("GrandChild", Child, {
        init: function () {
            this.superInit(arguments);
            println("GrandChild.init");
        },

        foo: function () {
            this.superCall("foo", arguments);
            println("GrandChild.foo: " + this.getClass().name);
        }
    });

    var obj = new GrandChild();
    obj.foo();
    println("Extra attr: " + obj.extra);
};

var testObserver1 = function () {
    var object = {
        field: "a value",
        method: function (arg) {
            println("Calling method: " + arg);
            return "returned value";
        }
    };

    var callback = Observer.observe(object, "method", function (arg) {
        println("Observer, arg is: " + arg);
    });

    Observer.observe(object, "method", function (arg) {
        println("Another observer");
    });

    println("Returning: " + object.method("arg val"));

    Observer.unobserve(object, "method", callback);

    println("Returning: " + object.method("new val"));
};

var main = function () {
    //test2();
    testObserver1();
};
