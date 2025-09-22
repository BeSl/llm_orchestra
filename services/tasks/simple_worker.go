package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

// SimpleWorker processes tasks by calling the Python LLM service
type SimpleWorker struct {
	llmURL   string
	interval time.Duration
}

// NewSimpleWorker creates a new simple worker
func NewSimpleWorker(llmURL string) *SimpleWorker {
	return &SimpleWorker{
		llmURL:   llmURL,
		interval: 5 * time.Second,
	}
}

// Start begins processing tasks (in this simplified version, it just logs that it's running)
func (w *SimpleWorker) Start() {
	log.Println("Simple worker started, will call LLM service at:", w.llmURL)

	for {
		log.Println("Worker is running... (in a real implementation, this would process tasks from a queue)")
		time.Sleep(w.interval)

		// In a real implementation, this would:
		// 1. Connect to a task queue (Redis, RabbitMQ, etc.)
		// 2. Pull tasks from the queue
		// 3. Process each task by calling the LLM service
		// 4. Update task status in the database
	}
}

// callLLMService calls the Python LLM service
func (w *SimpleWorker) callLLMService(taskType, prompt string, history []map[string]string) (string, error) {
	// Prepare request to Python LLM service
	llmRequest := map[string]interface{}{
		"task_type": taskType,
		"prompt":    prompt,
	}

	// Add history if available
	if history != nil {
		llmRequest["history"] = history
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

func main() {
	// Get LLM service URL from environment or use default
	llmURL := "http://localhost:8000/llm/process"

	worker := NewSimpleWorker(llmURL)
	worker.Start()
}
