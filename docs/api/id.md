## GET /api/id/bot

### Description
Get bot name by ID.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Parameters

| Name | Type   | Description |
|------|--------|-------------|
| `id`  | string | The ID of the bot to retrieve. |
| `chat` | string | The ID of the chat (optional, used to filter or specify context). |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg?` | string  | A message providing more details about the response (e.g., error or success message). |
| `name?` | string | The name of the bot retrieved by ID. |

### Example Response (Success)

```json
{
  "err": false,
  "name": "ChatBot_01"
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "bot is not found"
}
```


## Get /api/id/chat

### Description
Get chat name by ID.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Parameters

| Name | Type   | Description |
|------|--------|-------------|
| `chat`  | string | The ID of the chat to retrieve. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg?` | string  | A message providing more details about the response (e.g., error or success message). |
| `name?` | string | The name of the chat retrieved by ID. |

### Example Response (Success)

```json
{
  "err": false,
  "name": "Chat_01"
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "chat is not found"
}
```


## GET /api/id/event

### Description
Get event chat name by ID.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Parameters

| Name | Type   | Description |
|------|--------|-------------|
| `id`  | string | The ID of the event to retrieve. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg?` | string  | A message providing more details about the response (e.g., error or success message). |
| `name?` | string | The name of the event retrieved by ID. |

### Example Response (Success)

```json
{
    "err": false,
    "name": "Event_01"
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "event is not valid
}
```

## GET /api/id/u

### Description
Get user name by ID.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Parameters

| Name | Type   | Description |
|------|--------|-------------|
| `id`  | string | The ID of the user to retrieve. |
| `chat?` | string | The ID of the chat (optional, used to get nickname in realm). |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg?` | string  | A message providing more details about the response (e.g., error or success message). |
| `name?` | string | The name of the user retrieved by ID. |

### Example Response (Success)

```json
{
	"err": false,
	"name": "User_01"
}
```

### Example Response (Error)

```json
{
	"err": true,
	"msg": "user is not found"
}
```


## GET /api/id/wh

### Description
Get webhook name by ID.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Parameters

| Name | Type   | Description |
|------|--------|-------------|
| `id`  | string | The ID of the webhook to retrieve. |
| `chat` | string | The ID of the chat. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg?` | string  | A message providing more details about the response (e.g., error or success message). |
| `name?` | string | The name of the webhook retrieved by ID. |

### Example Response (Success)

```json
{
	"err": false,
	"name": "Webhook_01"
}
```

### Example Response (Error)

```json
{
	"err": true,
	"msg": "webhook is not found"
}
```