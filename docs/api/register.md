## POST /api/register

### Description
Register a new user.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Body
| Name | Type   | Description |
|------|--------|-------------|
| `name` | string | The name of the user to register. |
| `password` | string | The password of the user to register. |
| `email` | string | The email of the user to register. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg` | string  | A message providing more details about the response (e.g., error or success message). |

### Example Response (Success)

```json
{
    "err": false,
    "msg": "Verification code sent"
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "Password does not meet requirements!"
}
```


## POST /api/register-code

### Description
Register a new user. 2nd step.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Body
| Name | Type   | Description |
|------|--------|-------------|
| `code` | number | The code to register. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg` | string  | A message providing more details about the response (e.g., error or success message). |

### Example Response (Success)

```json
{
    "err": false,
    "msg": "Welcome!"
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "Invalid code. Attempts left: 2"
}
```