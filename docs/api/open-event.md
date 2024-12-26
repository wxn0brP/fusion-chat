## GET /api/open-event

### Description
Get message from open event channel.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Parameters

| Name | Type   | Description |
|------|--------|-------------|
| `realm`  | string | The ID of the realm |
| `chnl`   | string | The ID of the channel |
| `start`  | number | The start of the message to retrieve. (reverse) |
| `end`    | number | The end of the message to retrieve. (reverse) |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg?` | string  | A message providing more details about the response (e.g., error or success message). |
| `data?` | array   | The messages retrieved from the channel. |

#### `data`
| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `fr` | string  | The ID of the user who sent the message. |
| `msg` | string  | The message content. |

### Example Response (Success)

```json
{
    "err": false,
    "data": [
        {
            "fr": "user_id",
            "msg": "Hello world"
        }
    ]
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "channel is not open event"
}
```