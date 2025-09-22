FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY go.mod ./go.mod
RUN --mount=type=cache,target=/go/pkg/mod true
COPY . .
WORKDIR /src
RUN --mount=type=cache,target=/go/pkg/mod go build -o /out/orchestrator

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /out/orchestrator /usr/local/bin/orchestrator
ENV PORT=8080
EXPOSE 8080
CMD ["orchestrator"]