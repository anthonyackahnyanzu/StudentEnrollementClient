# 🏗️ Advanced Software Architecture and Design Patterns

## 📋 Learning Objectives

By the end of this material, students should understand:
- Trade-offs between monolithic and microservice architectures
- When to choose REST vs GraphQL for APIs
- How to leverage code generation tools for client-side development
- Advanced patterns in client-server architecture

---

## 🏢 Monoliths vs Microservices

### Monolithic Architecture

**Definition**: Single deployable unit containing all business logic, UI, and data access.

#### 👍 Advantages
- Simpler development workflow
- Easier testing (all components available)
- Less network complexity
- Lower initial operational overhead
- Faster for small teams and MVPs

#### 👎 Challenges
- Can become complex and hard to maintain
- Scaling is all-or-nothing
- Technology stack locked in
- Longer build/deploy times
- Risk of tight coupling

### Microservice Architecture

**Definition**: Collection of small, independent services that communicate via APIs.

#### 👍 Advantages
- Independent deployment
- Technology flexibility per service
- Easier to scale specific components
- Better fault isolation
- Supports multiple teams working independently

#### 👎 Challenges
- Increased operational complexity
- Network reliability concerns
- Service discovery and orchestration needed
- More complex testing
- Data consistency challenges

### 🔄 Migration Strategy: Monolith to Microservices

1. **Strangler Fig Pattern**
   - Gradually replace functionality
   - Keep monolith running during transition
   - Route traffic selectively

2. **Domain-First Approach**
   - Identify bounded contexts
   - Extract domain services one at a time
   - Maintain backwards compatibility

3. **Common Pitfalls**
   - Breaking too many things at once
   - Not having proper monitoring
   - Inadequate service boundaries

---

## 🌐 REST vs GraphQL

### REST (Representational State Transfer)

**Core Principles**:
- Resource-based
- Stateless
- Cacheable
- Uniform interface

#### 👍 Advantages
- Well-understood
- Great tooling
- Built-in HTTP caching
- Simpler to implement
- Better for file operations

#### 👎 Challenges
- Over/under-fetching
- Multiple round trips
- Versioning challenges
- Fixed response shape

### GraphQL

**Core Principles**:
- Single endpoint
- Client-specified queries
- Strong typing
- Hierarchical

#### 👍 Advantages
- Precise data fetching
- Reduced network requests
- Self-documenting
- Type safety
- Real-time with subscriptions

#### 👎 Challenges
- Learning curve
- Complex caching
- Potential performance issues
- Security considerations

### C# GraphQL Implementation Tools

#### Hot Chocolate (.NET)
- Most popular GraphQL server for .NET
- Full GraphQL spec implementation
- Built-in DataLoader support
- Subscription support via WebSockets
- Integration with EF Core and ASP.NET Core

```csharp
// Hot Chocolate setup example
services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddSubscriptionType<Subscription>()
    .AddFiltering()
    .AddSorting();

// Query type example
public class Query
{
    [UseDbContext(typeof(SchoolDbContext))]
    public IQueryable<Student> GetStudents([ScopedService] SchoolDbContext context) =>
        context.Students;
}
```

#### GraphQL .NET
- Mature, stable implementation
- Good for existing .NET applications
- Strong type system
- Custom middleware support
- REST-like development experience

```csharp
public class StudentType : ObjectGraphType<Student>
{
    public StudentType()
    {
        Field(x => x.Id);
        Field(x => x.Name);
        Field<ListGraphType<CourseType>>("courses",
            resolve: context => context.Source.Courses);
    }
}

public class StudentQuery : ObjectGraphType
{
    public StudentQuery(IStudentRepository repository)
    {
        Field<ListGraphType<StudentType>>("students",
            resolve: context => repository.GetAllStudents());
    }
}
```

#### Strawberry Shake (Client)
- GraphQL client for .NET
- Generate strongly-typed clients
- React to real-time updates
- Integrated with Hot Chocolate
- Local state management

```csharp
// Generated client usage
var client = new StudentClient();
var result = await client
    .GetStudents
    .ExecuteAsync();

var students = result.Data.Students;
```

#### Key Features Comparison

| Feature | Hot Chocolate | GraphQL .NET | Strawberry Shake |
|---------|---------------|--------------|------------------|
| Server Implementation | ✅ | ✅ | ❌ (client only) |
| Code-First | ✅ | ✅ | N/A |
| Schema-First | ✅ | ✅ | N/A |
| DataLoader | Built-in | Custom | N/A |
| Subscriptions | WebSocket/SSE | WebSocket | WebSocket |
| EF Core Integration | Native | Custom | N/A |
| Performance | Excellent | Good | N/A |

### When to Choose What?

**Choose REST when**:
- CRUD-heavy applications
- File uploads/downloads
- Need to leverage HTTP caching
- Simple resource relationships
- Public APIs

**Choose GraphQL when**:
- Complex data relationships
- Mobile applications (bandwidth concerns)
- Rapidly changing frontend needs
- Need for real-time updates
- Multiple client platforms

---

## ⚙️ Code Generation Tools

### NSwag Overview

**Purpose**: Generate client code from OpenAPI/Swagger specifications

#### Features
- TypeScript/JavaScript client generation
- C# client generation
- API documentation
- Strong typing
- Multiple template options

#### Example Setup (C#)

```csharp
// Install NSwag.AspNetCore
services.AddSwaggerDocument(config =>
{
    config.Title = "Student Enrollment API";
    config.Version = "v1";
});

// Generate TypeScript client
// nswag swagger2tsclient /input:swagger.json /output:api-client.ts
```

### Other Code Generation Tools

1. **OpenAPI Generator**
   - Multiple language support
   - Rich template ecosystem
   - Command line interface

2. **GraphQL Code Generator**
   - TypeScript types from schema
   - React/Apollo hooks
   - Type-safe operations

3. **Protobuf/gRPC**
   - Cross-platform RPC
   - Binary protocol
   - Strong typing

### Best Practices

1. **Version Control**
   - Commit generated code
   - Document generation steps
   - Use in CI/CD pipeline

2. **Maintenance**
   - Regular updates
   - Breaking change detection
   - Client library versioning

---

## 🎯 Advanced Client-Server Patterns

### 1. Backend for Frontend (BFF)
- Tailored API layer per client
- Optimized responses
- Client-specific caching

```typescript
// BFF Example
interface MobileStudentBFF {
    getCompactProfile(id: string): Promise<BasicProfile>;
}

interface WebStudentBFF {
    getFullProfile(id: string): Promise<DetailedProfile>;
}
```

### 2. CQRS in Practice
- Separate read/write models
- Optimized queries
- Event sourcing compatibility

```csharp
public interface ICommandHandler<TCommand>
{
    Task Handle(TCommand command);
}

public interface IQueryHandler<TQuery, TResult>
{
    Task<TResult> Handle(TQuery query);
}
```

### 3. Real-time Patterns
- WebSocket connections
- Server-Sent Events
- Long polling fallbacks

```typescript
// SignalR Hub Example
export class EnrollmentHub extends Hub {
    async onEnrollmentUpdate(studentId: string, status: string) {
        await this.Clients.Group(studentId).SendAsync("enrollmentChanged", status);
    }
}
```

---

## 🎓 Practical Exercise Ideas

1. **Microservices Migration**
   - Take a module from your monolith
   - Extract it to a microservice
   - Implement service communication

2. **GraphQL Integration**
   - Add GraphQL endpoint
   - Implement nested queries
   - Add real-time subscriptions

3. **Code Generation Pipeline**
   - Set up NSwag
   - Generate TypeScript client
   - Create strongly-typed React components

---

## 📚 Resources

- [Martin Fowler's Microservices Guide](https://martinfowler.com/articles/microservices.html)
- [GraphQL Official Documentation](https://graphql.org/)
- [NSwag GitHub Repository](https://github.com/RicoSuter/NSwag)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Patterns of Enterprise Application Architecture](https://www.martinfowler.com/books/eaa.html)

---

## 🤔 Discussion Questions & Key Points

1. When does the complexity of microservices become worth it?
   
   **Key considerations:**
   - Team size > 20-30 developers (multiple teams can work independently)
   - System needs different scaling requirements per component
   - Different parts need different technology stacks
   - Business domains are clearly separated
   - Organization structure supports independent teams (Conway's Law)
   - Budget available for infrastructure and DevOps
   - High availability requirements where partial failures are acceptable

2. How would you handle authentication across microservices?

   **Common approaches:**
   - **JWT tokens with central auth service**
     - Issue tokens from Identity Provider (e.g., IdentityServer4)
     - Validate tokens at API Gateway
     - Pass claims through service-to-service calls
   
   - **Service Mesh (e.g., Istio)**
     - Handle auth at infrastructure level
     - mTLS between services
     - Centralized policy enforcement
   
   - **Virtual Private Networks (VPN)**
     - Services only accessible within private network
     - Use network segmentation for security zones
     - Combine with internal PKI for service identity
   
   - **API Gateway pattern**
     - Single entry point for external requests
     - Token translation/exchange
     - Rate limiting and security policies

3. What criteria would you use to choose between REST and GraphQL?

   **Decision factors:**
   - **Data complexity**
     - Simple CRUD → REST
     - Complex nested data → GraphQL
   
   - **Client variety**
     - Single client type → REST may suffice
     - Multiple clients (web, mobile, desktop) → GraphQL's flexibility helps
   
   - **Network conditions**
     - Stable, fast networks → Either works
     - Mobile/unreliable networks → GraphQL reduces payload size
   
   - **Team experience**
     - REST is more widely known
     - GraphQL has steeper learning curve but better tooling
   
   - **Caching requirements**
     - HTTP caching important → REST
     - Client-side caching needed → GraphQL + Apollo/Relay

4. How can code generation improve your development workflow?

   **Benefits and approaches:**
   - **Type safety**
     - Catch errors at compile time
     - Automatic TypeScript interfaces from OpenAPI
     - GraphQL schema to strong types
   
   - **Productivity gains**
     - No manual API client maintenance
     - Consistent coding patterns
     - Automatic documentation
   
   - **Integration points**
     - Build pipeline generation
     - Git hooks for schema updates
     - IDE plugins for real-time generation
   
   - **Testing improvements**
     - Generated mock services
     - Type-safe test data builders
     - Contract test generation

5. What challenges have you faced in client-server architecture?

   **Common challenges and solutions:**
   - **State management**
     - Use proper caching strategies
     - Implement optimistic updates
     - Consider BFF pattern for complex UIs
   
   - **Error handling**
     - Consistent error response format
     - Retry policies with exponential backoff
     - Circuit breakers for failing services
   
   - **Performance**
     - Implement proper caching layers
     - Use compression
     - Consider GraphQL for selective data fetching
   
   - **Version management**
     - Semantic versioning
     - API versioning strategies
     - Backward compatibility policies
   
   - **Real-time updates**
     - WebSocket infrastructure
     - SignalR/Socket.IO implementation
     - Event-driven architecture