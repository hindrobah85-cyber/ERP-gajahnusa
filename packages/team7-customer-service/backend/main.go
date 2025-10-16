package main

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Ticket struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	TicketCode  string    `json:"ticket_code" gorm:"uniqueIndex"`
	CustomerID  uint      `json:"customer_id"`
	Subject     string    `json:"subject"`
	Description string    `json:"description"`
	Priority    string    `json:"priority"` // High, Medium, Low
	Status      string    `json:"status"`   // Open, Pending, In Progress, Resolved
	Assignee    string    `json:"assignee"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Customer struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`
	Email     string    `json:"email" gorm:"uniqueIndex"`
	Phone     string    `json:"phone"`
	Status    string    `json:"status"` // Active, VIP, Inactive
	Since     string    `json:"since"`
	CreatedAt time.Time `json:"created_at"`
}

type Message struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	TicketID   uint      `json:"ticket_id"`
	Sender     string    `json:"sender"`
	Message    string    `json:"message"`
	CreatedAt  time.Time `json:"created_at"`
}

var db *gorm.DB

func main() {
	// Initialize database
	var err error
	db, err = gorm.Open(sqlite.Open("customer_service.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Auto migrate
	db.AutoMigrate(&Ticket{}, &Customer{}, &Message{})

	// Initialize Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3007"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"service":   "Customer Service CRM API",
			"timestamp": time.Now(),
		})
	})

	// API routes
	api := r.Group("/api")
	{
		// Tickets
		tickets := api.Group("/tickets")
		{
			tickets.GET("", getAllTickets)
			tickets.GET("/:id", getTicketByID)
			tickets.POST("", createTicket)
			tickets.PUT("/:id", updateTicket)
			tickets.DELETE("/:id", deleteTicket)
		}

		// Customers
		customers := api.Group("/customers")
		{
			customers.GET("", getAllCustomers)
			customers.GET("/:id", getCustomerByID)
			customers.POST("", createCustomer)
			customers.PUT("/:id", updateCustomer)
		}

		// Messages
		messages := api.Group("/messages")
		{
			messages.GET("/ticket/:ticketId", getTicketMessages)
			messages.POST("", createMessage)
		}

		// Dashboard stats
		api.GET("/dashboard/stats", getDashboardStats)
	}

	// Start server
	println("🚀 Customer Service CRM API starting on http://localhost:8007")
	r.Run(":8007")
}

// Ticket handlers
func getAllTickets(c *gin.Context) {
	var tickets []Ticket
	db.Find(&tickets)
	c.JSON(http.StatusOK, tickets)
}

func getTicketByID(c *gin.Context) {
	id := c.Param("id")
	var ticket Ticket
	if err := db.First(&ticket, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}
	c.JSON(http.StatusOK, ticket)
}

func createTicket(c *gin.Context) {
	var ticket Ticket
	if err := c.ShouldBindJSON(&ticket); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Create(&ticket)
	c.JSON(http.StatusCreated, ticket)
}

func updateTicket(c *gin.Context) {
	id := c.Param("id")
	var ticket Ticket
	if err := db.First(&ticket, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}
	if err := c.ShouldBindJSON(&ticket); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Save(&ticket)
	c.JSON(http.StatusOK, ticket)
}

func deleteTicket(c *gin.Context) {
	id := c.Param("id")
	db.Delete(&Ticket{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Ticket deleted"})
}

// Customer handlers
func getAllCustomers(c *gin.Context) {
	var customers []Customer
	db.Find(&customers)
	c.JSON(http.StatusOK, customers)
}

func getCustomerByID(c *gin.Context) {
	id := c.Param("id")
	var customer Customer
	if err := db.First(&customer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}
	c.JSON(http.StatusOK, customer)
}

func createCustomer(c *gin.Context) {
	var customer Customer
	if err := c.ShouldBindJSON(&customer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Create(&customer)
	c.JSON(http.StatusCreated, customer)
}

func updateCustomer(c *gin.Context) {
	id := c.Param("id")
	var customer Customer
	if err := db.First(&customer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}
	if err := c.ShouldBindJSON(&customer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Save(&customer)
	c.JSON(http.StatusOK, customer)
}

// Message handlers
func getTicketMessages(c *gin.Context) {
	ticketID := c.Param("ticketId")
	var messages []Message
	db.Where("ticket_id = ?", ticketID).Find(&messages)
	c.JSON(http.StatusOK, messages)
}

func createMessage(c *gin.Context) {
	var message Message
	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Create(&message)
	c.JSON(http.StatusCreated, message)
}

// Dashboard stats
func getDashboardStats(c *gin.Context) {
	var stats struct {
		TotalTickets    int64 `json:"total_tickets"`
		OpenTickets     int64 `json:"open_tickets"`
		PendingTickets  int64 `json:"pending_tickets"`
		ResolvedTickets int64 `json:"resolved_tickets"`
		TotalCustomers  int64 `json:"total_customers"`
	}

	db.Model(&Ticket{}).Count(&stats.TotalTickets)
	db.Model(&Ticket{}).Where("status = ?", "Open").Count(&stats.OpenTickets)
	db.Model(&Ticket{}).Where("status = ?", "Pending").Count(&stats.PendingTickets)
	db.Model(&Ticket{}).Where("status = ?", "Resolved").Count(&stats.ResolvedTickets)
	db.Model(&Customer{}).Count(&stats.TotalCustomers)

	c.JSON(http.StatusOK, stats)
}
