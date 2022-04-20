# soapjsonproxy
A small service that allows to access soap webservices using a simple json api

## Example Request
```http
POST /
{
    "wsdl": "https://example.com/service.wsdl",
    "action": "MyAction",
    "args": {}
}
```
WSSecurity can be used by specifying the optional `username` and `password` parameters.

## Configuration
It's a pretty simple service and there is not much that can be configured, yet there are 2 configuration options
### Security
To prevent abuse of the service you can enable a simple bearer token authentication using the `API_KEY` environment variable.
### HTTP Port
By default the server starts on port 80, optionally you can change the port using the `HTTP_PORT`