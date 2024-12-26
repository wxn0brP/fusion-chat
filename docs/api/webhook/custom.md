## POST /api/webhook/custom

### Description
Webhook endpoint for custom webhooks.

### Codes
- 200: Success. Used `err` flag to indicate success or failure.
- 400: Bad request. Used `err` flag to indicate success or failure.
- 404: Not found. Used `err` flag to indicate success or failure.

### Parameters

| Name | Type   | Description |
|------|--------|-------------|
| `token`  | string | The token for authentication. |

### Body
Data to be sent to the webhook.

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg` | string  | A message providing more details about the response (e.g., error or success message). |

### Example Response (Success)

```json
{
    "err": false,
    "msg": "Webhook processed and message sent"
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "Invalid token"
}