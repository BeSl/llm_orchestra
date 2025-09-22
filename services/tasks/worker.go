package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TaskWorker processes tasks from the queue
type TaskWorker struct {
	db       *gorm.DB
	rdb      *redis.Client
	ctx      context.Context
	llmURL   string
	interval time.Duration
}

// NewTaskWorker creates a new task worker
func NewTaskWorker(db *gorm.DB, rdb *redis.Client, llmURL string) *TaskWorker {
	return &TaskWorker{
		db:       db,
		rdb:      rdb,
		ctx:      context.Background(),
		llmURL:   llmURL,
		interval: 1 * time.Second,
	}
}

// Start begins processing tasks
func (w *TaskWorker) Start() {
	log.Println("Task worker started")

	for {
		select {
		case <-w.ctx.Done():
			log.Println("Task worker stopped")
			return
		default:
			w.processNextTask()
			time.Sleep(w.interval)
		}
	}
}

// processNextTask processes the next task in the queue
func (w *TaskWorker) processNextTask() {
	// Pop task ID from queue
	taskIDStr, err := w.rdb.BRPop(w.ctx, 0, "task_queue").Result()
	if err == redis.Nil {
		// No tasks in queue
		return
	}

	if err != nil {
		log.Printf("Error reading from queue: %v", err)
		return
	}

	if len(taskIDStr) < 2 {
		log.Println("Invalid queue message")
		return
	}

	taskID, err := uuid.Parse(taskIDStr[1])
	if err != nil {
		log.Printf("Invalid task ID in queue: %v", err)
		return
	}

	log.Printf("Processing task: %s", taskID.String())

	// Process the task
	err = w.processTask(taskID)
	if err != nil {
		log.Printf("Error processing task %s: %v", taskID.String(), err)
	}
}

// processTask processes a specific task
func (w *TaskWorker) processTask(taskID uuid.UUID) error {
	// Fetch task from database
	var task Task
	result := w.db.First(&task, "id = ?", taskID)
	if result.Error != nil {
		return fmt.Errorf("failed to fetch task: %v", result.Error)
	}

	// Update task status to in progress
	task.Status = InProgress
	w.db.Save(&task)

	// Process the task with LLM service
	resultText, err := w.callLLMService(task)
	if err != nil {
		// Update task status to failed
		task.Status = Failed
		errorMsg := err.Error()
		task.Result = &errorMsg
		now := time.Now()
		task.CompletedAt = &now
		w.db.Save(&task)
		return err
	}

	// Update task with result
	task.Status = Completed
	task.Result = &resultText
	now := time.Now()
	task.CompletedAt = &now
	w.db.Save(&task)

	log.Printf("Task %s completed successfully", taskID.String())
	return nil
}

// callLLMService calls the Python LLM service
func (w *TaskWorker) callLLMService(task Task) (string, error) {
	// Prepare request to Python LLM service
	llmRequest := map[string]interface{}{
		"task_type": task.TaskType,
		"prompt":    task.Prompt,
	}

	// Add history if available
	if task.History != nil {
		var history []map[string]string
		err := json.Unmarshal([]byte(*task.History), &history)
		if err == nil {
			llmRequest["history"] = history
		}
	}

	// Convert request to JSON
	jsonData, err := json.Marshal(llmRequest)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %v", err)
	}

	// Make HTTP request to Python LLM service
	resp, err := http.Post(w.llmURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to call LLM service: %v", err)
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("LLM service returned status %d: %s", resp.StatusCode, string(body))
	}

	// Parse response
	var llmResponse map[string]interface{}
	err = json.Unmarshal(body, &llmResponse)
	if err != nil {
		return "", fmt.Errorf("failed to parse response: %v", err)
	}

	// Extract result
	result, ok := llmResponse["result"].(string)
	if !ok {
		return "", fmt.Errorf("invalid response format")
	}

	return result, nil
}
