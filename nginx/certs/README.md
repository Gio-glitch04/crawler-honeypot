Colocar aquí el certificado de origen de Cloudflare del dominio del honeypot:

- `honeypot.pem` (certificado)
- `honeypot.key` (clave privada, no subir a git)

Se genera en Cloudflare > SSL/TLS > Origin Server > Create Certificate.
Para pruebas locales, `scripts/selfsigned.sh` crea uno autofirmado.
