## POST /api/profile/upload

### Description
Upload a profile picture of the user.

### Codes
- 200: Success. Used `err` flag to indicate success or failure.
- 400: Bad request. Used `err` flag to indicate success or failure.
- 403: Forbidden. Used `err` flag to indicate success or failure.
- 500: Internal server error. Used `err` flag to indicate success or failure.

### Headers

| Name | Type   | Description |
|------|--------|-------------|
| `Authorization`  | string | The authorization token for authentication. |

### Body

| Name | Type   | Description |
|------|--------|-------------|
| `file`  | file | The profile picture file to upload. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg` | string  | A message providing more details about the response (e.g., error or success message). |
| `path?` | string | The path of the uploaded file. |

### Example Response (Success)

```json
{
    "err": false,
    "msg": "Profile picture uploaded successfully.",
    "path": "/path/to/file.png"
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "An error occurred while processing the image."
}


## GET /api/profile/img

### Description
Get the profile picture of the user.

### Codes
Always 200;

### Parameters

| Name | Type   | Description |
|------|--------|-------------|
| `id`  | string | The ID of the user to retrieve. |

### Response
Image file