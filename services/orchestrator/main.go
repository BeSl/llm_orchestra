package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

// User represents a user in the system
type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

// UserCreateRequest represents the request to create a user
type UserCreateRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

// UserUpdateRequest represents the request to update a user
type UserUpdateRequest struct {
	Username *string `json:"username,omitempty"`
	Password *string `json:"password,omitempty"`
	Role     *string `json:"role,omitempty"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type CreateMessageRequest struct {
	ConversationID string    `json:"conversation_id"`
	Messages       []Message `json:"messages"`
}

type LLMRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type LLMResponse struct {
	Content string `json:"content"`
}

func main() {
	dbURL := env("DATABASE_URL", "postgres://user:password@localhost:5432/llm_orchestra?sslmode=disable")
	llmURL := env("LLM_SERVICE_URL", "http://localhost:8082/generate")
	addr := env("PORT", "8080")

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("failed to connect to postgres: %v", err)
	}
	defer pool.Close()

	mux := http.NewServeMux()

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	// User Management Endpoints
	mux.HandleFunc("/v1/users", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			// Get all users
			rows, err := pool.Query(ctx, "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC")
			if err != nil {
				http.Error(w, "db error: "+err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			var users []User
			for rows.Next() {
				var user User
				err := rows.Scan(&user.ID, &user.Username, &user.Role, &user.CreatedAt)
				if err != nil {
					http.Error(w, "db scan error: "+err.Error(), http.StatusInternalServerError)
					return
				}
				users = append(users, user)
			}

			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(users)

		case http.MethodPost:
			// Create a new user
			var req UserCreateRequest
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, "bad request: "+err.Error(), http.StatusBadRequest)
				return
			}

			// Hash the password
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
			if err != nil {
				http.Error(w, "password hash error: "+err.Error(), http.StatusInternalServerError)
				return
			}

			// Insert user into database
			var user User
			err = pool.QueryRow(ctx, "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at",
				req.Username, string(hashedPassword), req.Role).Scan(&user.ID, &user.Username, &user.Role, &user.CreatedAt)
			if err != nil {
				http.Error(w, "db error: "+err.Error(), http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			_ = json.NewEncoder(w).Encode(user)

		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/v1/users/", func(w http.ResponseWriter, r *http.Request) {
		// Extract user ID from URL path
		userID := r.URL.Path[len("/v1/users/"):]

		switch r.Method {
		case http.MethodPut:
			// Update user
			var req UserUpdateRequest
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, "bad request: "+err.Error(), http.StatusBadRequest)
				return
			}

			// Build update query
			setParts := []string{}
			args := []interface{}{}
			argIndex := 1

			if req.Username != nil {
				setParts = append(setParts, fmt.Sprintf("username = $%d", argIndex))
				args = append(args, *req.Username)
				argIndex++
			}

			if req.Password != nil {
				hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
				if err != nil {
					http.Error(w, "password hash error: "+err.Error(), http.StatusInternalServerError)
					return
				}
				setParts = append(setParts, fmt.Sprintf("password_hash = $%d", argIndex))
				args = append(args, string(hashedPassword))
				argIndex++
			}

			if req.Role != nil {
				setParts = append(setParts, fmt.Sprintf("role = $%d", argIndex))
				args = append(args, *req.Role)
				argIndex++
			}

			if len(setParts) == 0 {
				http.Error(w, "no fields to update", http.StatusBadRequest)
				return
			}

			// Add user ID to args
			args = append(args, userID)

			// Update user in database
			query := fmt.Sprintf("UPDATE users SET %s WHERE id = $%d RETURNING id, username, role, created_at", strings.Join(setParts, ", "), argIndex)
			var user User
			err := pool.QueryRow(ctx, query, args...).Scan(&user.ID, &user.Username, &user.Role, &user.CreatedAt)
			if err != nil {
				http.Error(w, "db error: "+err.Error(), http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(user)

		case http.MethodDelete:
			// Delete user
			_, err := pool.Exec(ctx, "DELETE FROM users WHERE id = $1", userID)
			if err != nil {
				http.Error(w, "db error: "+err.Error(), http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusNoContent)

		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/v1/messages", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req CreateMessageRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "bad request", http.StatusBadRequest)
			return
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			http.Error(w, "db error", http.StatusInternalServerError)
			return
		}
		defer tx.Rollback(ctx)

		// Ensure conversation exists
		if req.ConversationID == "" {
			if err := tx.QueryRow(ctx, "insert into conversations default values returning id").Scan(&req.ConversationID); err != nil {
				http.Error(w, "db error", http.StatusInternalServerError)
				return
			}
		}

		// Insert user message (last in list if provided)
		var userContent string
		for _, m := range req.Messages {
			if m.Role == "user" {
				userContent = m.Content
			}
		}
		if userContent == "" && len(req.Messages) > 0 {
			userContent = req.Messages[len(req.Messages)-1].Content
		}
		if userContent != "" {
			if _, err := tx.Exec(ctx, "insert into messages(conversation_id, role, content) values($1,'user',$2)", req.ConversationID, userContent); err != nil {
				http.Error(w, "db error", http.StatusInternalServerError)
				return
			}
		}

		// Call LLM service
		llmReq := LLMRequest{Model: env("LLM_MODEL", "llama3"), Messages: req.Messages}
		httpClient := &http.Client{Timeout: 60 * time.Second}
		body, _ := json.Marshal(llmReq)
		httpReq, _ := http.NewRequest(http.MethodPost, llmURL, bytes.NewReader(body))
		httpReq.Header.Set("Content-Type", "application/json")
		resp, err := httpClient.Do(httpReq)
		if err != nil {
			_ = logDB(ctx, tx.(pgx.Tx), "llm_call_error", err.Error())
			http.Error(w, "llm service unavailable", http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()

		var llmResp LLMResponse
		if err := json.NewDecoder(resp.Body).Decode(&llmResp); err != nil {
			_ = logDB(ctx, tx.(pgx.Tx), "llm_decode_error", err.Error())
			http.Error(w, "bad llm response", http.StatusBadGateway)
			return
		}

		if _, err := tx.Exec(ctx, "insert into messages(conversation_id, role, content) values($1,'assistant',$2)", req.ConversationID, llmResp.Content); err != nil {
			http.Error(w, "db error", http.StatusInternalServerError)
			return
		}

		if err := tx.Commit(ctx); err != nil {
			http.Error(w, "db error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"conversation_id": req.ConversationID,
			"reply":           llmResp.Content,
		})
	})

	log.Printf("orchestrator listening on :%s", addr)
	if err := http.ListenAndServe(":"+addr, mux); err != nil {
		log.Fatal(err)
	}
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func bytesReader(b []byte) *bytesReaderType { return &bytesReaderType{b: b} }

type bytesReaderType struct {
	b []byte
	i int
}

func (r *bytesReaderType) Read(p []byte) (int, error) {
	if r.i >= len(r.b) {
		return 0, io.EOF
	}
	n := copy(p, r.b[r.i:])
	r.i += n
	return n, nil
}

func (r *bytesReaderType) Close() error { return nil }

func logDB(ctx context.Context, tx pgx.Tx, typ, msg string) error {
	_, err := tx.Exec(ctx, "insert into logs(type, message) values($1,$2)", typ, msg)
	return err
}
