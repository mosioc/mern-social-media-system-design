```mermaid
graph TD
    title[Kooroky Social Media Platform Use Case Diagram]

    %% Actors
    User((User))
    Admin((Admin))
    System((System))

    %% Authentication Use Cases
    auth[Authentication]
    register[Register]
    login[Login]
    logout[Logout]

    %% Post Management Use Cases
    posts[Post Management]
    createPost[Create Post]
    editPost[Edit Post]
    deletePost[Delete Post]
    likePost[Like Post]
    comment[Comment]
    sharePost[Share Post]
    uploadMedia[Upload Media]
    addCode[Add Code Snippet]

    %% Profile Management Use Cases
    profile[Profile Management]
    editProfile[Edit Profile]
    addSocialLinks[Add Social Links]
    viewProfile[View Profile]
    setBio[Set Bio]
    setLocation[Set Location]

    %% Friend Management Use Cases
    friends[Friend Management]
    addFriend[Add Friend]
    removeFriend[Remove Friend]
    viewFriends[View Friends List]

    %% Search & Feed Use Cases
    search[Search]
    searchUsers[Search Users]
    searchPosts[Search Posts]
    viewFeed[View Feed]
    filterPosts[Filter Posts]

    %% Chat Use Cases
    chat[Chat System]
    sendMessage[Send Message]
    receiveMessage[Receive Message]

    %% Relationships
    User --> auth
    auth --> register
    auth --> login
    auth --> logout

    User --> posts
    posts --> createPost
    posts --> editPost
    posts --> deletePost
    posts --> likePost
    posts --> comment
    posts --> sharePost
    posts --> uploadMedia
    posts --> addCode

    User --> profile
    profile --> editProfile
    profile --> addSocialLinks
    profile --> viewProfile
    profile --> setBio
    profile --> setLocation

    User --> friends
    friends --> addFriend
    friends --> removeFriend
    friends --> viewFriends

    User --> search
    search --> searchUsers
    search --> searchPosts
    User --> viewFeed
    viewFeed --> filterPosts

    User --> chat
    chat --> sendMessage
    chat --> receiveMessage

    Admin --> System
    System --> auth
    System --> posts
    System --> profile
    System --> friends
    System --> search
    System --> chat

    %% Styling
    classDef useCase fill:#f9f,stroke:#333,stroke-width:2px;
    classDef actor fill:#bbf,stroke:#333,stroke-width:4px;
    class auth,posts,profile,friends,search,chat useCase;
    class User,Admin,System actor;
    ```mermaid