## POST /api/fireToken

### Description
Link fire base token to fusion chat token.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Body
| Name | Type   | Description |
|------|--------|-------------|
| `fcToken` | string | The fusion chat token to link. |
| `fireToken` | string | The fire base token to link. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg` | string  | A message providing more details about the response (e.g., error or success message). |

### Example Response (Success)

```json
{
    "err": false,
    "msg": "ok"
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "invalid fcToken"
}
```

### Notes
- `fcToken` is a temporary token linked to the authenticated session.  
- It can be obtained from a logged-in socket using the `fireToken.get` event.  
- The `fcToken` is valid for 2 minutes, so it must be used promptly after being issued.  