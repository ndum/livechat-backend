# Live Chat Backend

This is a simple backend for a live chat, developed using Node.js, Express, MongoDB, WebSocket, and JWT authentication. It was primarily created for the "WEB I" course at HF-Informatik, with a focus on teaching REST endpoint handling. Please note: this is for educational purposes and should not be used in a production environment.

## Features

- RESTful API for creating, retrieving, updating, and deleting chat messages.
- Real-time message transmission with Websockets
- User registration and login with JWT authentication.
- API documentation with Swagger.
- MVC architecture for clean and maintainable code.

## Prerequisites

- Node.js and npm
- MongoDB

## Installation

1. Clone the repository or download it.
2. Change into the project directory.
3. Install the dependencies.
4. Create a .env file in the main directory and add the necessary configurations.
5. Start the server.

The server runs by default on port 3000 unless you change the port in the .env file.

### Using Docker Compose
1. Clone the repository or download it.
2. Change into the project directory.
3. Create the `.env` file in the main directory and add the necessary configurations
4. Run the following command to start the server
```bash
docker-compose up -d
```

## API Endpoints and Documentation

The API documentation was created with Swagger and can be viewed at `http://localhost:3000/api/docs`.

## Websocket Messages

For real-time interactions, the application employs WebSocket messages. Below are the messages and their corresponding types utilized:

- User Logged In

```json
{
    "type": "new_login",
    "data": {
        "username": "test"
    }
}
```

- User Data Update

```json
{
    "type": "changed_user",
    "data": {
        "_id": "651be37456dc1b604443de3c",
        "username": "test2",
        "password": "",
        "created_at": "2023-10-03T09:48:36.724Z",
        "updated_at": "2023-10-03T09:49:41.120Z",
        "__v": 0
    }
}
```

- User Deletion

```json
{
    "type": "deleted_user",
    "data": {
        "_id": "651be37456dc1b604443de3c",
        "username": "test2",
        "password": "",
        "created_at": "2023-10-03T09:48:36.724Z",
        "updated_at": "2023-10-03T09:49:41.120Z",
        "__v": 0
    }
}
```

- New Message Creation

```json
{
    "type": "new_message",
    "data": {
        "_id": "651be6f256dc1b604443de5a",
        "username": "test",
        "message": "test",
        "createdAt": "2023-10-03T10:03:30.459Z",
        "updatedAt": "2023-10-03T10:03:30.460Z",
        "__v": 0
    }
}
```

- Message Update

```json
{
    "type": "changed_message",
    "data": {
        "_id": "651be6f256dc1b604443de5a",
        "username": "test",
        "message": "test2",
        "createdAt": "2023-10-03T10:03:30.459Z",
        "updatedAt": "2023-10-03T10:04:35.836Z",
        "__v": 0
    }
}
```

- Message Deletion

```json
{
    "type": "deleted_message",
    "data": {
        "_id": "651be6f256dc1b604443de5a",
        "username": "test",
        "message": "test2",
        "createdAt": "2023-10-03T10:03:30.459Z",
        "updatedAt": "2023-10-03T10:04:35.836Z",
        "__v": 0
    }
}
```

## Tests

To run the tests, use the following command:

`npm test`

## Possible Improvements

- Add authorization.
- Implement rate limiting.
- Add logging and monitoring.
- Improve data validation and centralized error handling.
- Convert from CommonJS to ES6 Modules (conversion planned for 2024).

## LICENSE

Live Chat Backend is MIT-licensed. For more details see &rarr; [LICENSE](LICENSE)

## Copyright

&copy; 2023 - Nicolas Dumermuth