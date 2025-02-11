# nodejs-api-test-framework
API with Swagger written in nodeJs, tested with typescript.

## How to launch the program
- Open git bash in VS Code.
- To launch the node.js server type 
```
node index.js
```
- In your browser, navigate to http://localhost:5000/api-docs/#/ to launch the APIs Swagger definition.

## Conventions
This project uses feature branches. Create a branch using this convention: 
```
your-name/feature-name
```

## Description of the database models
- Client (*Client.js*) → Basic schema with *name* and *email* (unique).
- Order (*Order.js*) → Orders reference a *client* (*clientId*), contain *items* (each referencing *productId*), calculate *totalPrice*, and track *status* (*pending*, *shipped*, *delivered*, *canceled*).
- Product (*Product.js*) → Simple model with *name* and *price*.
