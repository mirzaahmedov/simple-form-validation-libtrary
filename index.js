const patterns = {
    email: /([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/,
    password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
}

const validation = (test, msg) => (value) => test(value) ? null : msg

class Field {
    constructor(name) {
        this.name = name
        this.flags = {
            required: false,
        }
        this.validationFunctions = []
    }
    validate(value) {
        for (const validationFunction of this.validationFunctions) {
            const error = validationFunction(value)
            if (error) return error
        }
        return null
    }
}
class StringField extends Field {
    required() {
        this.flags.required = true
        return this
    }
    email(msg = `${this.name} is invalid email`) {
        this.validationFunctions.push(
            validation((value) => patterns.email.test(value), msg)
        )
        return this
    }
    password(msg = `${this.name} is weak password`) {
        this.validationFunctions.push(
            validation((value) => patterns.password.test(value), msg)
        )
        return this
    }
}
class NumberField extends Field {
    required() {
        this.flags.required = true
        return this
    }
    max(limit, msg = `${this.name} must be less than ${limit}`) {
        this.validationFunctions.push(
            validation((value) => value <= limit, msg)
        )
        return this
    }
    min(limit, msg = `${this.name} must be more than ${limit}`) {
        this.validationFunctions.push(
            validation((value) => value >= limit, msg)
        )
        return this
    }
}

export class Schema {
    constructor(fields) {
        this.fields = {}
        for (const [name, callback] of Object.entries(fields)) {
            this.fields[name] = callback({
                string() {
                    return new StringField(name)
                },
                number() {
                    return new NumberField(name)
                },
            })
        }
    }
    validateForm(form) {
        let valid = true
        const errors = {}
        for (const [name, field] of Object.entries(this.fields)) {
            errors[name] = null
            if (!form[name]) {
                if (field.flags.required) {
                    valid = false
                    errors[name] = `${name} is required`
                }
                continue
            }
            for (const validationFunction of field.validationFunctions) {
                const error = validationFunction(form[name])
                if (error) {
                    valid = false
                    errors[name] = error
                    break
                }
            }
        }
        return { valid: valid, errors: errors }
    }
    validateField(name, value) {
        let error = null
        if (!value) {
            if (this.fields[name].flags.required) {
                error = `${name} is required`
            }
            return error
        }
        for (const validationFunction of this.fields[name]
            .validationFunctions) {
            error = validationFunction(value)
            if (error) {
                return error
            }
        }
        return error
    }
}
