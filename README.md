# Simple Validation library

## Usage

```js
import { Schema } from "./validation"

const schema = new Schema({
    first_name: (field) => field.string().required(),
    last_name: (field) => field.string().required(),
    email: (field) => field.string().required().email(),
    password: (field) => field.string().required().password(),
})

const { valid, errors } = schema.validateForm({
    first_name: "john",
    last_name: "doe",
    email: "john@doe.com",
    password: "password"
})
```

```

```
