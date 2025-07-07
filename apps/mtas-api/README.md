
# RSA key par generation
#### 2048-bit private key
openssl genrsa -out private.pem 2048

#### Extract the matching public key
openssl rsa -in private.pem -pubout -out public.pem

# Example env vars lookup
.env
POSTGRES_HOST=localhost
POSTGRES_PORT=5434
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=mtas-db
PORT=5001
JWT_SECRET=asdfasdf
JWT_EXPIRATION_TIME=3600

docker.env
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=nestjs
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin