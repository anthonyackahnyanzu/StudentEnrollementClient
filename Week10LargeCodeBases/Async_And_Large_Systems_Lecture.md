
# 🧭 Working in Large Codebases + Async vs. Sync Projects

### Lecture Theme:
**Building Scalable Background Systems Beyond Request/Response**

---

## 🎯 Learning Objectives

By the end of this session, students should be able to:

- Distinguish between **synchronous** and **asynchronous** programming.
- Identify use cases where **long-running tasks** are required.
- Understand how **background processing** fits into modern software systems.
- Recognize tools and architectures used in **large-scale, asynchronous systems**.
- Discuss real-world examples beyond API request/response cycles.

---

## 🧩 Part 1 — Large Codebases and Architecture

### 🧱 What Makes a “Large” Codebase?

- Many interdependent modules (API, UI, services, jobs)
- Multiple teams working in parallel
- Shared infrastructure (databases, caches, queues)
- Emphasis on **maintainability** and **clarity**, not just functionality

### 🧠 Best Practices

- **Layered architecture**: Separation between API, service, and data layers.
- **Dependency Injection**: Avoid tight coupling.
- **SOLID principles**: Keep components focused and replaceable.
- **Configuration and logging**: Avoid magic values and invisible errors.

### ⚙️ Configuration and logging (Extra credit)

This is a potential extra-credit opportunity: add proper **configuration** and **structured logging** to your project and demonstrate how they improve observability, maintainability, and debugging for long-running or distributed systems.

What to implement (suggested minimum):
- Centralized configuration using appsettings.json and the Options pattern (`IOptions<T>`).
- Environment-specific overrides (e.g. `appsettings.Development.json`) and sensitive values in user secrets / environment variables.
- Add logging to critical flows (enrollment, background job queueing, job processing, error paths).
- Integrate Serilog as the structured logging provider and configure at least one sink (console + file or Seq/Elastic).

Short contract (inputs/outputs, success criteria):
- Inputs: existing .NET Web API project (Program.cs), `appsettings.json`.
- Outputs: updated Program.cs wiring, an `appsettings.json` sample, and sample service/controller usage showing logs and bound configuration.
- Success: application logs meaningful structured events (with properties) and configuration values are bound to POCOs and respect environment overrides.

Why this matters
- Configuration separates code from environment-specific values and credentials. Tests and deployments are easier when you centralize configuration.
- Structured logging (JSON + named properties) makes it simple to query logs, correlate events across services, and power dashboards/alerts.

Quick .NET Core examples

1) appsettings.json (snippet)

```json
{
    "Logging": {
        "LogLevel": {
            "Default": "Information",
            "Microsoft": "Warning"
        }
    },
    "ConnectionStrings": {
        "Default": "Server=...;Database=...;User Id=...;Password=..."
    },
    "Serilog": {
        "Using": [],
        "MinimumLevel": "Information",
        "WriteTo": [
            { "Name": "Console" },
            { "Name": "File", "Args": { "path": "Logs/log-.txt", "rollingInterval": "Day" } }
        ],
        "Enrich": [ "FromLogContext", "WithMachineName", "WithProcessId" ]
    }
}
```

2) Program.cs (minimal host) — Microsoft.Extensions.Logging + Serilog integration

```csharp
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Read Serilog configuration from appsettings
Log.Logger = new LoggerConfiguration()
        .ReadFrom.Configuration(builder.Configuration)
        .Enrich.FromLogContext()
        .CreateLogger();

builder.Host.UseSerilog();

// Configure services and options
builder.Services.Configure<MyOptions>(builder.Configuration.GetSection("MyOptions"));

var app = builder.Build();

app.MapGet("/", (ILogger<Program> logger) =>
{
        logger.LogInformation("Hello world endpoint hit at {Time}", DateTime.UtcNow);
        return Results.Ok("ok");
});

app.Run();
```

3) Using ILogger in a service (structured logging)

```csharp
public class EnrollmentService
{
        private readonly ILogger<EnrollmentService> _logger;

        public EnrollmentService(ILogger<EnrollmentService> logger)
        {
                _logger = logger;
        }

        public Task EnrollStudentAsync(int studentId, CancellationToken ct)
        {
                _logger.LogInformation("Starting enrollment for {StudentId}", studentId);
                try
                {
                        // ... enrollment logic
                        _logger.LogInformation("Enrollment succeeded for {StudentId}", studentId);
                }
                catch (Exception ex)
                {
                        _logger.LogError(ex, "Enrollment failed for {StudentId}", studentId);
                        throw;
                }

                return Task.CompletedTask;
        }
}
```

Microsoft.Extensions.Logging — quick summary
- Built into ASP.NET Core and the Generic Host.
- Provides ILogger<T>, log levels, and a provider model. Providers (Console, Debug, EventSource, EventLog) write to different targets.
- Good for standard, lightweight logging with dependency injection and filtering by category/level.

Serilog — quick summary and sinks
- Serilog is a popular structured-logging library that integrates well with .NET through `Serilog.AspNetCore` and the `UseSerilog()` host hook.
- Sinks: output targets for logs. Popular sinks include:
    - Console (human-friendly or JSON)
    - File / Rolling file
    - Seq (http://datalust.co/seq) — great for local structured log exploration
    - Elasticsearch (for ELK stacks)
    - Application Insights
    - Datadog, Splunk, SQL, Kafka, many community sinks
- Advantages of Serilog for structured logging:
    - Structured events: log properties (e.g. {StudentId}, {RequestId}) are emitted as typed fields, not just string text — this enables rich queries and dashboards.
    - Wide ecosystem of sinks and enrichers (machine name, process id, thread id, correlation ids).
    - Flexible configuration: read from appsettings.json, enrichers, filters, and per-sink level overrides.
    - Efficient and safe handling of destructuring complex objects.

Extra-credit ideas for the assignment
- Add Serilog and one additional sink (File + Seq or File + Elasticsearch). Demonstrate searching and filtering logs by StudentId or JobId.
- Add configuration binding for a feature toggle or an external API client and show environment overrides.
- Add correlation ids for background jobs and show how to propagate them into log context for traceability.

Notes and best practices
- Avoid logging secrets — use configuration and secret stores for credentials.
- Use structured properties, not string concatenation, to ensure logs are machine-parseable.
- Ensure logs from background workers include enough context (job id, user id, attempt number) to diagnose failures.
- Consider log retention and cost when writing to cloud sinks.


### 💬 Discussion Prompt

> In your projects, where does complexity usually appear first — business logic, data access, or async flow?

---

## ⚙️ Part 2 — Synchronous vs Asynchronous Programming

### 🔹 Synchronous

- Code executes **in order**.
- Each call **blocks** until the previous one completes.
- Great for **simple, deterministic** operations.

```csharp
// Example: synchronous file read
var data = File.ReadAllText("report.txt");
Console.WriteLine("File loaded");
```

### 🔹 Asynchronous

- Code **does not block** while waiting for I/O.
- Multiple operations can be **in flight**.
- Great for network calls, disk I/O, and parallel computation.

```csharp
// Example: asynchronous file read
using System.IO;
using System.Threading.Tasks;

async Task ReadReportAsync()
{
    var data = await File.ReadAllTextAsync("report.txt");
    Console.WriteLine("File loaded asynchronously");
}

await ReadReportAsync();
```

---

### 🧰 Tools Across Languages

| Language | Async Tooling | Notes |
|-----------|----------------|-------|
| **C#** | async/await, Task, IHostedService | Task-based async pattern |
| **Python** | asyncio, Celery | Event loops + distributed tasks |
| **JavaScript** | async/await, Promises | Frontend and backend concurrency |
| **Java** | CompletableFuture, Spring Async | Thread pools and futures |
| **Go** | goroutines, channels | Lightweight concurrency primitives |

---

## 🕓 Part 3 — Long-Running, Background, and Scheduled Jobs

### 🧠 Why Not Handle Everything in APIs?

APIs are **short-lived** by design. Long tasks block resources and slow user responses.

Instead, offload these to **background processes**.

---

### 🏗️ Real-World Examples

| Use Case | Description |
|-----------|--------------|
| 📩 **Email Processing** | Sending welcome or notification emails asynchronously |
| 🧾 **Report Generation** | Generating PDFs, analytics, or dashboards overnight |
| 🧮 **Data ETL Pipelines** | Extract-transform-load jobs into data warehouses |
| 📦 **Inventory Sync** | Pulling stock data from third-party systems |
| 💰 **Billing & Invoicing** | Monthly invoice generation, transaction reconciliation |
| 🧠 **AI Model Training** | Long-running ML jobs |
| 📱 **Push Notifications** | Batch sending notifications |
| 🔄 **Video/Media Processing** | Encoding and thumbnail generation after upload |
| 🧍 **User Onboarding Flow** | Trigger workflows like account verification or document review |

---

### 🧰 Common Tools and Frameworks

| Category | Tools | Description |
|-----------|--------|-------------|
| **Job Schedulers** | Quartz.NET, Hangfire, Cron | Run periodic tasks |
| **Job Queues** | RabbitMQ, Azure Service Bus, AWS SQS | Offload async work |
| **Background Services** | IHostedService, Windows Service, Hangfire | Execute jobs outside main thread |
| **Serverless Functions** | Azure Functions, AWS Lambda | Event-driven, scalable workloads |

---

### 💡 Example (C#)

```csharp
// Async background job using a queue
public class ReportService
{
    private readonly IBackgroundJobQueue _queue;

    public ReportService(IBackgroundJobQueue queue)
    {
        _queue = queue;
    }

    public void RequestReportGeneration(int userId)
    {
        _queue.Enqueue(() => GenerateReportAsync(userId));
        Console.WriteLine("Report generation queued.");
    }

    private async Task GenerateReportAsync(int userId)
    {
        await Task.Delay(5000); // Simulate long task
        Console.WriteLine($"Report for user {userId} generated.");
    }
}
```

**Discussion Prompt:**  
> What types of async jobs might exist in a university enrollment system?

---

## 🛰️ Part 4 — Event-Driven Architecture

### 🔹 Why Events?

- Decouple systems.  
- Improve scalability.  
- Avoid waiting on slow processes.

### 🔄 Example Flow

**User signs up → Queue → Welcome Email → Analytics Event → Data Warehouse Update**

Each step runs independently.

---

### 🧰 Common Event Tools

| Category | Example | Use |
|-----------|----------|-----|
| Message Broker | RabbitMQ, Kafka | Publish/Subscribe communication |
| Event Bus | MediatR, MassTransit | In-app event flow |
| Cloud Services | AWS SNS/SQS, Azure Event Grid | Scalable eventing at cloud scale |

---

### 💡 Example (C# with MediatR)

```csharp
public class StudentRegisteredEvent : INotification
{
    public int StudentId { get; }
    public StudentRegisteredEvent(int studentId) => StudentId = studentId;
}

public class SendWelcomeEmailHandler : INotificationHandler<StudentRegisteredEvent>
{
    public async Task Handle(StudentRegisteredEvent notification, CancellationToken cancellationToken)
    {
        await EmailService.SendWelcomeEmailAsync(notification.StudentId);
        Console.WriteLine("Welcome email sent.");
    }
}
```

---

## 🧱 Part 5 — Designing for Scale and Reliability

### 🧩 Design Patterns

#### **1. Producer–Consumer Pattern**
- Separates job creation from job processing.
- Uses a **queue** to handle variable workloads.
- Ideal for background task systems or job schedulers.

#### **2. CQRS (Command Query Responsibility Segregation)**
- Splits read and write operations.
- Improves scalability for heavy read systems.
- Write = Commands → Update state  
  Read = Queries → Return projections or summaries

#### **3. Event Sourcing**
- Stores **changes (events)** instead of the final state.
- Useful for auditing, replaying history, and debugging.
- Example: track student enrollment over time as events.

#### **4. Saga Pattern**
- Manages **distributed transactions** across multiple systems.
- Uses **compensating actions** to roll back when part of a process fails.
- Example: enrolling a student and assigning to a dormitory—if dorm assignment fails, roll back enrollment.

#### **5. Retry and Circuit Breaker Pattern**
- Handle transient failures gracefully.
- Retry failed operations with backoff and open a circuit if the service is unhealthy.

---

## 🧠 Common Pitfalls

- Fire-and-forget jobs without error handling.
- Unawaited async calls (silent failures).
- Race conditions when updating shared resources.
- Deadlocks from sync-over-async code.
- Lack of observability — no logs or job tracking.

---

## 🧪 Project Idea: Async Analysis Tool

you can expand some of these ideas into your project.

**Possible Stack:**  
- Backend: .NET 8 Web API + BackgroundService  
- Queue: Azure Service Bus / RabbitMQ / In-memory queue  
- Frontend: React Dashboard

---

## 🧭 Wrap-Up

### 💡 Key Takeaways

- Async ≠ parallel — it’s about *not waiting*.
- Background jobs and queues improve scalability.
- Message-driven design enables reliability and decoupling.
- Observability (logs, retries, metrics) is key.

### 🧠 Discussion

> Where can your system benefit from async or event-driven design?

---
