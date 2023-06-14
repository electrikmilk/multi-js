# multi-js
Run functions parallel in JavaScript.

Run a function on the web worker side. This comes with limited access to the window object and no access to the DOM, but will run in the worker thread.

```javascript
// Complex example:
new Thread(() => {
    // do stuff...
}, () => {
  // error callback...
}, 'background'); // priority (web worker scheduler API)

// It can be this simple:
new Thread(myFunction)
```
