window.EventEmitter = function () {
    this.subscribers = {};
};

// IIFE
(function(EE) {
    //// instanceOfEE.on('touchdown', cheerFn);
    EE.prototype.on = function(eventName, eventListener) {
        // if instance's subscribers object does not have key,
        // create it and assign empty array.
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }
        // push the given listener function into the array.
        this.subscribers[eventName].push(eventListener);

    };

    //// instanceOfEE.emit('event', 'other args1', 'other args2');
    EE.prototype.emit = function (eventName) {
        //// no subscriber fns
        if (!this.subscribers[eventName]) {
            return;
        }
        // grab the remaining arguments to our emit function.
        const remainingArgs = [].slice.call(arguments, 1);
        // for each subscriber fn, call it with our arguments.
        this.subscribers[eventName].forEach(listener => {
            listener.apply(null, remainingArgs);
        });
    };
})(window.EventEmitter);
