```mermaid
graph TD
    Start((Start)) --> Login[/Login Form/]
    Login --> ValidateAuth{Authenticate}
    ValidateAuth -->|Invalid| Login
    ValidateAuth -->|Valid| HomePage
    
    HomePage --> Feed[View Feed]
    HomePage --> Profile[View Profile]
    HomePage --> Search[Search]
    HomePage --> Chat[Chat]
    
    Feed --> CreatePost[Create Post]
    CreatePost --> AddText[Add Text]
    CreatePost --> AddMedia[Add Media]
    CreatePost --> AddCode[Add Code Snippet]
    CreatePost --> PublishPost[Publish Post]
    
    Feed --> InteractPost[Interact with Post]
    InteractPost --> Like[Like/Unlike]
    InteractPost --> Comment[Add Comment]
    InteractPost --> Delete[Delete Own Post]
    
    Profile --> EditProfile[Edit Profile]
    EditProfile --> UpdateInfo[Update Info]
    EditProfile --> UpdateSocials[Update Social Links]
    EditProfile --> UpdateLocation[Update Location]
    
    Search --> SearchUsers[Search Users]
    Search --> SearchPosts[Search Posts]
    
    Chat --> SendMessage[Send Message]
    Chat --> ReceiveMessage[Receive Message]
    Chat --> AIChat[Chat with AI]
    
    %% Friend Management
    Profile --> FriendActions[Friend Management]
    FriendActions --> AddFriend[Add Friend]
    FriendActions --> RemoveFriend[Remove Friend]
    FriendActions --> ViewFriends[View Friends List]
    
    %% WebSocket Events
    PublishPost -.->|WebSocket| UpdateFeed[Update Feed]
    Like -.->|WebSocket| UpdateLikes[Update Likes]
    Comment -.->|WebSocket| UpdateComments[Update Comments]
    
    %% End states
    UpdateFeed --> Feed
    UpdateLikes --> Feed
    UpdateComments --> Feed
    
    %% Styling
    classDef default fill:#f9f,stroke:#333,stroke-width:2px
    classDef start fill:#bbf,stroke:#333,stroke-width:4px
    class Start start
    ```mermaid