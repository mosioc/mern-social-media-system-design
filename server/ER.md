```mermaid
erDiagram
    User ||--o{ Post : creates
    User ||--o{ Comment : makes
    User ||--o{ Like : gives
    User }|--o{ User : friends
    Post ||--o{ Comment : has
    Post ||--o{ Like : receives

    User {
        ObjectId _id
        string firstName
        string lastName
        string email
        string password
        string uniqueId
        string picturePath
        array friends
        string location
        string occupation
        number viewedProfile
        number impressions
        object socialLinks
        string bio
        date createdAt
        date updatedAt
    }

    Post {
        ObjectId _id
        string userId
        string firstName
        string lastName
        string location
        string description
        string picturePath
        string userPicturePath
        Map likes
        array comments
        object code
        date createdAt
        date updatedAt
    }

    Comment {
        string userId
        string firstName
        string lastName
        string text
        string userPicturePath
        date createdAt
    }

    Like {
        string userId
        boolean value
    }

    SocialLinks {
        string twitter
        string linkedin
        string instagram
        string facebook
    }

    Code {
        string content
        string language
    }
```mermaid