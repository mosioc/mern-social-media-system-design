```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Service
    participant U as User Service
    participant P as Post Service
    participant WS as WebSocket
    participant DB as Database
    
    %% Authentication Flow
    C->>A: Register/Login Request
    A->>DB: Validate Credentials
    DB-->>A: User Data
    A-->>C: Auth Token + User Info
    
    %% Post Management
    C->>P: Create Post
    P->>DB: Save Post
    DB-->>P: Confirm Save
    P->>WS: Broadcast New Post
    WS-->>C: Update Feed (Real-time)
    
    %% Social Interactions
    C->>P: Like/Comment
    P->>DB: Update Post
    DB-->>P: Updated Post
    P->>WS: Broadcast Update
    WS-->>C: Update UI (Real-time)
    
    %% Profile Management
    C->>U: Update Profile
    U->>DB: Save Changes
    DB-->>U: Updated Profile
    U-->>C: Confirm Update
    
    %% Search Operations
    C->>U: Search Users
    U->>DB: Query Users
    DB-->>U: User Results
    U-->>C: User List
    
    C->>P: Search Posts
    P->>DB: Query Posts
    DB-->>P: Post Results
    P-->>C: Post List
    
    %% Friend Management
    C->>U: Add/Remove Friend
    U->>DB: Update Friends List
    DB-->>U: Updated Friends
    U-->>C: Friend Status
    
    %% Chat System
    C->>WS: Send Message
    WS->>DB: Store Message
    DB-->>WS: Confirm Save
    WS-->>C: Message Delivered
    ```mermaid