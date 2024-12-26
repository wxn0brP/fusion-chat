## GET /api/iv/bot

### Description
Invite a bot to a realm.

### Codes    
Always 200, but returns a JSON response used flag `err`.

### Headers

| Name | Type   | Description |
|------|--------|-------------|
| `Authorization`  | string | The authorization token for authentication. |

### Parameters

| Name | Type   | Description |
|------|--------|-------------|
| `id`  | string | The ID of the bot to invite. |
| `realm` | string | The ID of the realm to invite the bot to. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg` | string  | A message providing more details about the response (e.g., error or success message). |


## GET /api/iv/bot/meta

### Description
Get information about a bot.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Headers

| Name | Type   | Description |
|------|--------|-------------|
| `Authorization`  | string | The authorization token for authentication. |

### Parameters

| Name | Type   | Description |
|------|--------|-------------|
| `id`  | string | The ID of the bot to retrieve. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg?` | string  | A message providing more details about the response (e.g., error or success message). |
| `data?` | object  | The data of the bot. |

#### `data`
| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `name` | string  | The name of the bot. |
| `realms` | array  | An array of realm IDs that the bot is invited to. |

### Example Response (Success)

```json
{
    "err": false,
    "data": {
        "name": "bot_name",
        "realms": [
            "realm_id1",
            "realm_id2"
        ]
    }
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "bot not found"
}