package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

// TaskStatus represents the status of a task
type TaskStatus string

const (
	Pending    TaskStatus = "pending"
	InProgress TaskStatus = "in_progress"
	Completed  TaskStatus = "completed"
	Failed     TaskStatus = "failed"
)

// Task represents a task in the system
type Task struct {
	ID          string     `json:"id"`
	UserID      string     `json:"user_id"`
	TaskType    string     `json:"task_type"`
	Prompt      string     `json:"prompt"`
	Status      TaskStatus `json:"status"`
	Result      *string    `json:"result"`
	CreatedAt   time.Time  `json:"created_at"`
	CompletedAt *time.Time `json:"completed_at"`
	History     *string    `json:"history"` // Store as JSON string
}

// TaskCreateRequest represents the request to create a task
type TaskCreateRequest struct {
	TaskType string              `json:"task_type" binding:"required"`
	Prompt   string              `json:"prompt" binding:"required"`
	History  []map[string]string `json:"history,omitempty"`
}

// TaskResponse represents the response for a task
type TaskResponse struct {
	ID          string              `json:"id"`
	UserID      string              `json:"user_id"`
	TaskType    string              `json:"task_type"`
	Prompt      string              `json:"prompt"`
	Status      TaskStatus          `json:"status"`
	Result      *string             `json:"result"`
	CreatedAt   time.Time           `json:"created_at"`
	CompletedAt *time.Time          `json:"completed_at"`
	History     []map[string]string `json:"history,omitempty"`
}

func main() {
	// Start HTTP server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	// Add new endpoints for task management
	http.HandleFunc("/tasks", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			createTaskHandler(w, r)
		case http.MethodGet:
			getAllTasksHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/tasks/", func(w http.ResponseWriter, r *http.Request) {
		// Extract task ID from URL
		path := r.URL.Path[len("/tasks/"):]

		// Check if it's a stats endpoint
		if path == "stats/status" {
			getTaskStatsByStatusHandler(w, r)
			return
		} else if path == "stats/type" {
			getTaskStatsByTypeHandler(w, r)
			return
		}

		// Otherwise, it's a task ID
		switch r.Method {
		case http.MethodGet:
			getTaskHandler(w, r)
		case http.MethodDelete:
			deleteTaskHandler(w, r, path)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	log.Printf("Task service starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func createTaskHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req TaskCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get user ID from header (in real implementation, this would come from auth)
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		http.Error(w, "X-User-ID header is required", http.StatusBadRequest)
		return
	}

	// Serialize history to JSON string
	var historyJSON *string
	if req.History != nil {
		historyBytes, err := json.Marshal(req.History)
		if err != nil {
			http.Error(w, "Invalid history format", http.StatusBadRequest)
			return
		}
		historyStr := string(historyBytes)
		historyJSON = &historyStr
	}

	// Create a simple task ID (in real implementation, use UUID)
	taskID := fmt.Sprintf("task_%d", time.Now().Unix())

	// Create task
	task := Task{
		ID:        taskID,
		UserID:    userID,
		TaskType:  req.TaskType,
		Prompt:    req.Prompt,
		Status:    Pending,
		History:   historyJSON,
		CreatedAt: time.Now(),
	}

	// In a real implementation, we would:
	// 1. Store the task in a database
	// 2. Add the task to a queue for processing
	// 3. Return the task ID

	// For now, just return a mock response
	response := map[string]interface{}{
		"task_id": task.ID,
		"status":  task.Status,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func getTaskHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract task ID from URL
	// In a real implementation, we would fetch the task from the database

	// For now, just return a mock response
	task := Task{
		ID:        "task_123",
		UserID:    "user_123",
		TaskType:  "summarization",
		Prompt:    "Summarize this text",
		Status:    Completed,
		Result:    stringPtr("This is a summary"),
		CreatedAt: time.Now(),
	}

	response := TaskResponse{
		ID:        task.ID,
		UserID:    task.UserID,
		TaskType:  task.TaskType,
		Prompt:    task.Prompt,
		Status:    task.Status,
		Result:    task.Result,
		CreatedAt: task.CreatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func stringPtr(s string) *string {
	return &s
}

func convertTaskToResponse(task Task) TaskResponse {
	resp := TaskResponse{
		ID:          task.ID,
		UserID:      task.UserID,
		TaskType:    task.TaskType,
		Prompt:      task.Prompt,
		Status:      task.Status,
		Result:      task.Result,
		CreatedAt:   task.CreatedAt,
		CompletedAt: task.CompletedAt,
	}

	// Deserialize history from JSON string
	if task.History != nil {
		var history []map[string]string
		err := json.Unmarshal([]byte(*task.History), &history)
		if err == nil {
			resp.History = history
		}
	}

	return resp
}

// getAllTasksHandler returns all tasks
func getAllTasksHandler(w http.ResponseWriter, r *http.Request) {
	// In a real implementation, we would fetch tasks from the database
	// For now, just return a mock response
	tasks := []Task{
		{
			ID:        "task1",
			UserID:    "user1",
			TaskType:  "summarization",
			Prompt:    "Summarize this text",
			Status:    Completed,
			Result:    stringPtr("This is a summary"),
			CreatedAt: time.Now().Add(-time.Hour),
		},
		{
			ID:        "task2",
			UserID:    "user2",
			TaskType:  "translation",
			Prompt:    "Translate this text",
			Status:    InProgress,
			CreatedAt: time.Now().Add(-time.Minute * 30),
		},
		{
			ID:        "task3",
			UserID:    "user1",
			TaskType:  "code_generation",
			Prompt:    "Generate code for a function",
			Status:    Failed,
			CreatedAt: time.Now().Add(-time.Minute * 10),
			Result:    stringPtr("Error: Invalid prompt"),
		},
	}

	// Convert tasks to response format
	var responses []TaskResponse
	for _, task := range tasks {
		responses = append(responses, convertTaskToResponse(task))
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

// deleteTaskHandler deletes a task by ID
func deleteTaskHandler(w http.ResponseWriter, r *http.Request, taskID string) {
	// In a real implementation, we would delete the task from the database
	// For now, just return a success response
	w.WriteHeader(http.StatusNoContent)
}

// getTaskStatsByStatusHandler returns task statistics by status
func getTaskStatsByStatusHandler(w http.ResponseWriter, r *http.Request) {
	// In a real implementation, we would calculate stats from the database
	// For now, just return mock statistics
	stats := map[string]int{
		"pending":     5,
		"in_progress": 3,
		"completed":   20,
		"failed":      2,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// getTaskStatsByTypeHandler returns task statistics by type
func getTaskStatsByTypeHandler(w http.ResponseWriter, r *http.Request) {
	// In a real implementation, we would calculate stats from the database
	// For now, just return mock statistics
	stats := map[string]int{
		"summarization":   10,
		"translation":     8,
		"code_generation": 7,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
