(function(window, undefined) {
    var rootIO, // io(document)
    //
    // Hugging every cool little function name, I know... it's evil ;)
    _$ = window.$, __ = window._, _io = window.io,
    //
    // Important elements from the window argument
    document = window.document, navigator = window.navigator,
    //
    // Core function shorthands
    _trim       = String.prototype.trim,
    _property   = Object.prototype.hasOwnProperty,
    _toString   = Object.prototype.toString,
    _indexOf    = Array.prototype.indexOf,
    _slice      = Array.prototype.slice,
    _push       = Array.prototype.push,

    /**
     * FINALLY we get to our sweet IO function!!!
     */
    io = function(query, context) { return new io.prototype.init(query, context, rootIO); };

    io.pro = io.prototype = {
        init: function(query, context, rootIO) {
            // @=Handle io(), io(""), io(undefined), io(false)
            if (!query) { return this; }

            // @=Handle io(DOMElement)
            if (query.nodeType) {
                this.context = this[0] = query;
                this.length = 1;
                return this;
            }

            if (typeof query === "object") {
                this.context = this[0] = query;
                this.length = 1;
            }

            // @=Handle query string
            // Define vars

            var i=0, _id="#", _tag=/^([a-z1-6_-]+)$/i, _class=".", _rel=">", _ids=[], _tags=[], _classes=[], space=/\s+/;

            if (typeof query === "string") {
                this.queryString = query;
                // @=Optimize for whatever case we can foresee
                if (query === "body") {
                    this.context = this[0] = rootIO[0].body;
                    this.length = 1;
                    return this;
                }
                /****************************************
                 * @=Context
                 ****************************************/
                if (context !== undefined && context.nodeType) {
                    this.context = context;
                } else if (context instanceof io) {
                    if (context.context !== undefined && context.context.nodeType) {
                        this.context = context.context;
                    } else {
                        this.context = io[0] || rootIO[0];
                    }
                } else {
                    this.context = rootIO[0];
                }
                /****************************************
                 * @=Parse Query
                 ****************************************/
                query = query.split(space);
                if (typeof query === "object" && query.length > 0) {
                    var a = query, tagclass, tagobj = {};
                    for (; i < a.length; i++) {
                        if (_tag.test(a[i])) { _tags.push(a[i]); continue; }
                        if (a[i].indexOf(_id) !== -1) { _ids.push(a[i].replace(_id, "")); continue; }
                        // if (a[i].indexOf(_class) !== -1) { _classes.push(a[i].replace(_class, "")); }
                        if (a[i].indexOf(_class) !== -1) {
                            if (a[i].indexOf(_class) === 0) { // .class
                                tagobj.ctag = false;
                                tagobj.cname = a[i].replace(_class, "");
                                _classes.push(tagobj);
                            } else { // tag.class
                                tagclass = a[i].split(_class);
                                tagobj.ctag = tagclass[0];
                                tagobj.cname = tagclass[1];
                                _classes.push(tagobj);
                            }
                        }
                    }
                    obj = {"ids":_ids, "tags":_tags, "classes":_classes};
                }
                /****************************************
                 * @=Query Selection
                 ****************************************/
                var elements;
                if (obj.ids && obj.ids.length > 0) {
                    elements = io.prototype.byid(obj.ids, this.context);
                    if (elements.nodeType) {
                        this[this.length] = elements;
                        this.length = this.length + 1;
                        this.context = elements;
                    } else {
                        var x = 0;
                        for (; x < elements.length; x++) {
                            this[this.length] = elements[x];
                            this.context = this.context || elements[x];
                            this.length = this.length + 1;
                        }
                    }
                }
                if (obj.tags && obj.tags.length > 0) {
                    elements = io.prototype.bytag(obj.tags, this.context);
                    var j = 0;
                    for (; j < elements.length; j++) {
                        this[this.length] = elements[j];
                        this.length = this.length + 1;
                        this.context = this.context || elements[j];
                    }
                }
                if (obj.classes && obj.classes.length > 0) {
                    elements = io.prototype.byclass(obj.classes, this.context);
                    var z = 0;
                    for (; z < elements.length; z++) {
                        this[this.length] = elements[z];
                        this.length = this.length + 1;
                        this.context = this.context || elements[z];
                    }
                }
            }
            return this;
        },
        constructor: io,
        queryObject: {},
        queryString: "",
        context: {},
        version: 1,
        length: 0,
        byid: function(ids, scope) {
            if (typeof ids === "string") { ids = [ids]; scope = scope || rootIO[0]; }
            var len = ids.length, element, elements = [];

            for (var i = 0; i < len; i++) {
                element = ids[i];
                if (typeof element === 'string') {
                    element = scope.getElementById(element);
                    if (element === null) { continue; }
                }
                if (ids.length === 1) {
                    return element;
                }
                elements.push(element);
            }
            return elements;
        },
        bytag: function(tags, scope) {
            var i=0, len=tags.length, element, elements = [];
            for (; i < len; i++) {
                element = tags[i];
                if (typeof element === "string") {
                    element = scope.getElementsByTagName(element);
                    if (tags.length === 1) { return element; }
                    elements.push(element);
                }
            }
            return elements;
        },
        byclass: (function() {
            var bycls;
            if (!!document.getElementsByClassName) {
                bycls = function (names, tag, el) {
                    console.log(el);
                    var elm = el && el.getElementsByClassName ? el : document,
                        elements = elm.getElementsByClassName(names),
                        thenode = tag ? new RegExp("\\b" + tag + "\\b", "i") : null,
                        found = [],
                        i = 0,
                        l = elements.length,
                        current;
                        console.log(thenode);
                    for (; i < l; i++) {
                        current = elements[i];
                        if (!thenode || thenode.test(current.nodeName)) {
                            found.push(current);
                        }
                    }
                    return found;
                };
            }
            else if (!!document.querySelectorAll) {
                bycls = function (names, tag, el) {
                    var elements = (el || document).querySelectorAll((tag || "") + "." + names.split(" ").join(".")),
                        found = [],
                        l = elements.length,
                        i = 0;
                    for (; i < l; i++) {
                        found.push(elements[i]);
                    }
                    return found;
                };
            }
            else if (!!document.evaluate) {
                bycls = function (names, tag, el) {
                    var classes = names.split(" "),
                        classesToCheck = "",
                        found = [],
                        l = classes.length,
                        i = 0, elements, node;
                    for(; i < l; i++){
                        classesToCheck += "[contains(concat(' ', normalize-space(@class), ' '), ' " + classes[i] + " ')]";
                    }
                    elements = document.evaluate(".//" + (tag || "*") + classesToCheck, (el || document), null, 0, null);
                    while ((node = elements.iterateNext())) {
                        found.push(node);
                    }
                    return found;
                };
            }
            else {
                bycls = function (names, tag, el) {
                    el  = el    || document;
                    tag = tag   || '*';
                    var classes = String.prototype.split(names, ' '),
                        classesToCheck = [],
                        elements = tag == '*' && el.all ? el.all : el.getElementsByTagName(tag),
                        found = [],
                        i = 0,
                        j = 0,
                        il = classes.length,
                        jl = elements.length,
                        current, match, k, kl;
                    for (; i < il; i++) {
                        classesToCheck.push(new RegExp("(^|\\s)" + classes[i] + "(\\s|IO)"));
                    }
                    kl = classesToCheck.length;
                    for (; j < jl; j++) {
                        current = elements[j];
                        match = false;
                        for (k = 0; k < kl; k++) {
                            match = classesToCheck[k].test(current.className);
                            if (!match) {
                                break;
                            }
                        }
                        if (match) {
                            found.push(current);
                        }
                    }
                    return found;
                };
            }
            return function(obj, scope) {
                var i=0, n=obj.length, elements = [];
                if (typeof obj === "object" && n > 0) {
                    for (; i < n; i++) {
                        if (obj[i].ctag && obj[i].cname) {
                            elements = elements.concat(bycls(obj[i].cname, obj[i].ctag, scope));
                        } else {
                            elements = elements.concat(bycls(obj[i].cname, null, scope));
                        }
                    }
                }
                return elements;
            };
        })(),

        /**
         * @=EVENTS
         * What a turn of events, did anyone suspected it? ; )
         */
        ev: (function () {
            var getelement, setelement, bind, unbind, isquirky, iscompliant, handlers=[], listeners=[], root=document.documentElement;
            var isset = function (i) { return !!(typeof i !== 'undefined' && typeof i !== null); };

            var can = function (obj) {
                var args = Array.prototype.slice.call(arguments, 1), n=args.length, i=0;
                if (!isset(obj) || n <= 0) { return false; }
                for (; i < n; i++) {
                    if ('function|object|unknown'.indexOf(typeof obj[args[i]]) < 0) { return false; }
                }
                return true;
            };

            (function () {
                var elements= [];
                getelement  = function (id) { return elements[id]; };
                setelement  = function (id, element) { elements[id] = element; };
            })();

            var uuid = (function () {
                if (isset(root.uniqueID)) {
                    return function (element) {
                        return element.uniqueID;
                    };
                }
                var id = 0;
                return function (element) {
                    return element.__uniqueID || (element.__uniqueID = 'uniqueID__' + id++);
                };
            })();

            var wraphandler = function (id, handler) {
                return function (e) {
                    handler.call(getelement(id), e || window.event);
                };
            };

            var makehandler = function (id, handler) {
                return {
                    handler: handler,
                    wrapped: wraphandler(id, handler)
                };
            };

            var dispatcher = function (id, ev) {
                return function (e) {
                    if (handlers[id] && handlers[id][ev]) {
                        var funcs = handlers[id][ev], len=funcs.length, i=0;
                        for (; i < len; i++) {
                            if (isset(funcs[i])) { funcs[i].call(this, e || window.event); }
                        }
                    }
                };
            };

            isquirky    = !!(can(root, 'attachEvent', 'detachEvent') && can(window, 'attachEvent', 'detachEvent'));
            iscompliant = !!(can(root, 'addEventListener', 'removeEventListener') && can(window, 'addEventListener', 'removeEventListener'));

            if (iscompliant) {
                bind = function (el, ev, handler) { el.addEventListener(ev, handler, false); };
                unbind = function (el, ev, handler) { el.removeEventListener(ev, handler, false); };
            }
            else if (isquirky) {
                bind = function (el, ev, handler) {
                    var id = uuid(el);
                    setelement(id, el);
                    if (!listeners[id]) { listeners[id] = []; }
                    if (!listeners[id][ev]) { listeners[id][ev] = []; }
                    var listener = makehandler(id, handler);
                    listeners[id][ev].push(listener);
                    el.attachEvent('on' + ev, listener.wrapped);
                };

                unbind = function (el, ev, handler) {
                    var id = uuid(el), listener;
                    if (listeners[id] && listeners[id][ev]) {
                        var len = listeners[id][ev].length;
                        for (var i=0; i < len; i++) {
                            listener = listeners[id][ev][i];
                            if (listener && listener.handler === handler) {
                                el.detachEvent('on' + ev, listener.wrapped);
                                listeners[id][ev][i] = null;
                            }
                        }
                    }
                };
            }
            else {
                // UNLIKELY!
                bind = function (el, ev, handler) {
                    var id = uuid(el);
                    if (!handlers[id]) { handlers[id] = []; }
                    if (!handlers[id][ev]) {
                        handlers[id][ev] = [];
                        var activeHandler = el['on' + ev];
                        if (activeHandler) {
                            handlers[id][ev].push(activeHandler);
                        }
                        el['on' + ev] = dispatcher(id, ev);
                    }
                    handlers[id][ev].push(handler);
                };
                unbind = function (el, ev, handler) {
                    var id = uuid(el);
                    if (handlers[id] && handlers[id][ev]) {
                        var funcs = handlers[id][ev];
                        var len = funcs.length;
                        for (var i=0; i < len; i++) {
                            if (funcs[i] === handler) {
                                funcs.splice(i, 1);
                            }
                        }
                    }
                };
            }

            var bindall = function (opt) {
                if (!!opt.events && !!opt.elements && !!opt.callback) {
                    for (var i=0; i < opt.events.length; i++) {
                        for (var x=0; x < opt.elements.length; x++) {
                            bind(opt.elements[x], opt.events[i], opt.callback);
                        }
                    }
                }
                return opt;
            };

            var unbindall = function (opt) {
                if (!!opt.events && !!opt.elements && !!opt.callback) {
                    for (var i=0; i < opt.events.length; i++) {
                        for (var x=0; x < opt.elements.length; x++) {
                            unbind(opt.elements[x], opt.events[i], opt.callback);
                        }
                    }
                }
            };

            return {
                bind: bind,
                unbind: unbind,
                bindall: bindall,
                unbindall: unbindall
            };
        })(),

        /**
         * @=UTIL
         * Utilities for working with CSS
         */
        util: (function() {
            var hasclass = function (el, cls) {
                if (typeof el === 'undefined' || el===null || !RegExp) { return false; }
                var rx = new RegExp("(^|\\s)" + cls + "(\\s|$)");
                if (typeof (el) === 'string') {
                    return rx.test(el);
                }
                else if (typeof (el) === 'object' && !!el.className) {
                    return rx.test(el.className);
                }
                return false;
            };

            var getclass = function (el) {
                if ('undefined' !== el) { return !!el.className ? el.className : ''; }
            };

            var addclass = function (el, cls) {
                if (!hasclass(el, cls)) {
                    if (getclass(el) === '') {
                        el.className =  cls;
                    } else {
                        el.className += ' ' + cls;
                    }
                }
            };

            var removeclass = function (el, cls) {
                if (typeof el === 'undefined' || el===null || !RegExp) { return false; }
                var rx = new RegExp("(^|\\s)" + cls + "(\\s|$)");
                if (typeof (el) === 'string') {
                    return rx.test(el);
                }
                else if (typeof (el) === 'object' && el.className) {
                    return rx.test(el.className);
                }
                return false;
            };
            return {
                cls: function(el, str, remove) {
                    if (typeof str !== "string") { return getclass(el); }
                    addclass(el, str);
                },
                rmcls: removeclass
            };
        })(),

        /**
         * @=Requests
         * Asynchronous requests are just so demanding, always asking for stuff!
         */
        req: (function() {
            var REQUEST;
            var FACTORY = [
                function() { return new XMLHttpRequest(); },
                function() { return new ActiveXObject('Msxml2.XMLHTTP'); },
                function() { return new ActiveXObject('Msxml3.XMLHTTP'); },
                function() { return new ActiveXObject('Microsoft.XMLHTTP'); }
            ];

            var ins = function() {
                if (typeof REQUEST === 'undefined') {
                    var i=0, len=FACTORY.length;
                    for (; i < len; i++) {
                        try {
                            REQUEST = FACTORY[i]();
                        } catch(e) {
                            continue;
                        }
                        break;
                    }
                }
                return REQUEST;
            };

            var headers = function (req, headers) {
                if (isempty(req) || isempty(headers)) { return false; }
                var key;
                for (key in headers) {
                    if (owns(headers, key) && can(req, 'setRequestHeader')) { req.setRequestHeader(key, headers[key]); }
                }
                return req;
            };

            var query = function (data) {
                if (isempty(data)) { return false; }
                var key, count=0, query='';
                for (key in data) {
                    if (owns(data, key)) {
                        query = (count) ? query + '&' + key + '=' + data[key] : query + key + '=' + data[key];
                    }
                    count++;
                }
                return query;
            };

            var request = function (url, onsuccess, onfailure, data, headers) {
                var req = ins();
                if (req) {
                    try {
                        var method = (typeof data === 'object' && !isempty(data)) ? 'POST' : 'GET';
                        req.open(method, url, true);
                        req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
                        if (method === 'POST') { req.setRequestHeader('Content-type','application/x-www-form-urlencoded'); }
                        if (typeof headers === 'object' && !isempty(headers)) { req = headers(req, headers); }
                    } catch(e) { if (can(console, 'log')) {console.log(e); } }

                    req.onreadystatechange = function() {
                        if (req.readyState === 4) {
                            if (req.status === 200 || req.status === 304) { onsuccess(req); } else { onfailure(req); }
                        }
                    };

                    try {
                        if (typeof data === 'object') {
                            req.send(query(data));
                        } else {
                            req.send();
                        }
                    } catch(ev) { console.log(ev); }
                }
            };
            return {
                request: request
            };
        })(),

        alpha: function() { return this[0]; },
        omega: function() { var index = this.length - 1; return this[index]; },
        each: function(callback) {
            if (this instanceof io) {
                var i=0, n=this.length;
                for (; i < n;) {
                    if (callback.call(this[i], i, this[i++]) === false) { break; }
                }
            }
        }
    };
    /**
     * Candy done, let's export it.
     */
    rootIO      = io(document);
    io.req      = io.pro.req.request;
    io.byid     = io.pro.byid;
    io.cls      = io.pro.util.cls;
    io.rmcls    = io.pro.util.rmcls;
    io.bind     = io.pro.ev.bind;
    io.unbind   = io.pro.ev.unbind;
    io.prototype.init.prototype = io.prototype;
    window.io = io;
})(window);
