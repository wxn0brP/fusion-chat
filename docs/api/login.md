## POST /api/login

### Description
Login to fusion chat.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Body
| Name | Type   | Description |
|------|--------|-------------|
| `name` | string | The name of the user to login. (Or email) |
| `password` | string | The password of the user to login. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg` | string  | A message providing more details about the response (e.g., error or success message). |
| `token` | string | The token of the user logged in. |
| `from` | string | The name of the user logged in. |
| `user_id` | string | The ID of the user logged in. |

### Example Response (Success)

```json
{
    "err": false,
    "msg": "ok",
    "from": "user_name",
    "token": "jwt_token",
    "user_id": "user_id"
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "Invalid credentials"
}
```