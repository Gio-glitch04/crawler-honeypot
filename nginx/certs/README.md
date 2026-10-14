Colocar aquí el certificado de origen de Cloudflare del dominio del honeypot:

- `honeypot.pem` (certificado)
- `honeypot.key` (clave privada, no subir a git)

Se genera en Cloudflare > SSL/TLS > Origin Server > Create Certificate.
Para pruebas locales, `scripts/selfsigned.sh` crea uno autofirmado.

Sin estos dos archivos el contenedor `nginx-proxy` se reinicia en bucle con
`cannot load certificate "/etc/nginx/certs/honeypot.pem"`. Alternativa sin
bash ni openssl (solo Docker), desde la raíz del proyecto:

    docker run --rm -v "${PWD}/nginx/certs:/certs" python:3.12-slim openssl req -x509 -nodes -newkey rsa:2048 -days 30 -keyout /certs/honeypot.key -out /certs/honeypot.pem -subj "/CN=localhost"
