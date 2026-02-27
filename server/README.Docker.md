### Docker (Dev)

From the repo root, start the development stack (bind-mount + hot reload):
`docker compose -f docker-compose.dev.yml up --build`.

Your API will be available at http://localhost:5000.

### Docker (Production)

From the repo root, start the production stack (built image, no bind-mount):
`docker compose -f docker-compose.prod.yml up --build`.

### Deploying your application to the cloud

First, build your image, e.g.: `docker build -t myapp .`.
If your cloud uses a different CPU architecture than your development
machine (e.g., you are on a Mac M1 and your cloud provider is amd64),
you'll want to build the image for that platform, e.g.:
`docker build --platform=linux/amd64 -t myapp .`.

Then, push it to your registry, e.g. `docker push myregistry.com/myapp`.

Consult Docker's [getting started](https://docs.docker.com/go/get-started-sharing/)
docs for more detail on building and pushing.

### References

- [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)
