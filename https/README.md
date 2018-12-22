## Create an SSL certificate and place the generated files into this directory.

Website for downloading openssl:<br>
[https://www.openssl.org/source](https://www.openssl.org/source)

Command for creating a SSL certificate:<br>
`openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem`