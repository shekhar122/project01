//make one method and export it

/*
const asyncHandler = (requestHandler) => { ... }: 
    This line declares a constant asyncHandler which is a function. 
    It takes another function requestHandler as an argument.

Inside the asyncHandler function, there's an arrow function (req, res, next) => { ... }. 
This inner function is what will actually be called when a route is matched in your Express application.

Promise.resolve(requestHandler(req, re, next)): 
    This line is resolving the promise returned by the requestHandler function. 
    requestHandler is called with three arguments: 
        req (request object), 
        res (response object), 
        and next (next middleware function).
    If requestHandler returns a promise, it will be awaited. 
    If it returns a value other than a promise, 
    Promise.resolve() ensures it's wrapped in a resolved promise.

.catch((err) => next(err)): 
    This line handles any errors that might occur during the execution of requestHandler. 
    If an error occurs, it calls the next function with the error object,
    which passes the error to the Express error handling middleware.

Now, asyncHandler can be used to wrap asynchronous 
route handlers in Express middleware to handle errors gracefully.
*/ 


const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((err) => next(err))
    } 
}



export {asyncHandler}

// const asyncHandler = () => {}
// const asyncHandler = (func) => {() => {}}
// const asyncHandler = (func) => async () => {}

/* 
it wraps asynchronous route handlers to handle errors gracefully.
However, it's written in a different style using async and await syntax.

const asyncHandler = (fn) => async (req, res, next) => { ... }: 
    This line defines a function called asyncHandler. 
    It takes a function fn as an argument and returns another function.
    The returned function is an asynchronous function that takes the standard
        Express middleware parameters (req, res, next).

try { ... } catch (error) { ... }: 
    Inside the returned function, there's a try...catch block. 
    This is a standard JavaScript construct for handling errors. 
    The code inside the try block is the asynchronous function fn(req, res, next) being awaited.

await fn(req, res, next): 
    This line awaits the execution of the asynchronous function fn 
        with the Express middleware parameters req, res, and next. 
    This function is the actual route handler that is passed to asyncHandler.

If an error occurs during the execution of fn, it's caught by the catch block.

res.status(err.code || 500).json({ success: false, message: err.message }): 
If an error occurs, this line sends an error response back to the client. 
It sets the HTTP status code to err.code if it exists, 
otherwise defaults to 500 (Internal Server Error). 
Then it sends a JSON response with success set to false and message set to the error message.

*/

/*
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}
*/