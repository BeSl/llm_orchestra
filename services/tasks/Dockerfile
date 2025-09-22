FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod ./

# Download all dependencies
RUN go mod download

# Copy source code
COPY ./*.go ./

# Build the binaries
RUN go build -o task-service main.go
RUN go build -o task-worker simple_worker.go

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binaries from builder stage
COPY --from=builder /app/task-service .
COPY --from=builder /app/task-worker .

# Expose port
EXPOSE 8081

# Run the service by default
CMD ["./task-service"]