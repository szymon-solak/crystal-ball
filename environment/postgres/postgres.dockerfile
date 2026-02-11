FROM postgres:17-trixie

RUN apt update

RUN DEBIAN_FRONTEND=noninteractive apt install -y --no-install-recommends \
	ca-certificates curl libcurl3-gnutls \
	&& rm -rf /var/lib/apt/lists/*

ADD --checksum=sha256:a625819c0e60b431c65e12815f9de0a7f044eca02cc9c222e2a3b322ecaa2e2a https://github.com/DataDog/pg_tracing/releases/download/v0.1.3/postgresql-17-pg-tracing_0.1.3_amd64.deb /tmp/pg_tracing.deb
RUN dpkg -i /tmp/pg_tracing.deb
