# HMAC SHA Authorization Client

Javascript client for https://github.com/philipbrown/signature-php

## Installation

If you are not using bower then just download and include the .js file (hmac-sha-auth-client.js) after the dependences (CryptoJS hmac-md5.js and hmac-sha256.js).

Using Bower:

bower install hmac-sha-auth-cli


## Usage

After included, you can easy prepare a request:

```javascript
HMACShaAuthCli.includeAuthParams(user,password,resource,method,params);
```

And the library will include the auth params into your params object. For example:

```javascript
params = {name:"food"};
HMACShaAuthCli.includeAuthParams("admin","thisissecret","/categories","POST",params);
```
After the call, your params object will be like:
```javascript
{name:"food", auth_version: "3.0.2", auth_key: "admin", auth_timestamp: 1428145023, auth_signature: "1cba9f2d932f452fb98f20f15vsa5c80a4d9720bf454b5ac4bb544c1d6f0c6e5"}
```

And you can send it to the PHP server to get authorized.

Also, if you're calling with GET method, you can use an util function to include the params as GET URL params:
```javascript
params = {};
resource = "/users";
HMACShaAuthCli.includeAuthParams("admin","thisissecret",resource,"GET",params);
resource = HMACShaAuthCli.addParamsToUrl(resource,params);
// Now resource is like: /users?auth_version=3.0.2&auth_key=admin&auth_timestamp=1428145161&auth_signature=1cba9f2d945f452fb98f20f15ad56k80a4d9720bf024b5ac4bb544c1d6f0c6e5
```

On a GET/POST/PUT/DELETE petition, PHP recieves booleans as strings, converting true to "true" and false to "false". So you can't use that param as a boolean directly. From version 2.1.0, that library converts your javascript booleans to 1 and 0, so you can use it in PHP as booleans directly.
If you don't want this functionality, simply do:
```javascript
HMACShaAuthCli.convertBooleans = false;
```