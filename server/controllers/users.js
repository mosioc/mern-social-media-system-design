import User from "../models/User.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((friend) => friend !== friendId);
      friend.friends = friend.friends.filter((user) => user !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((friendId) => User.findById(friendId))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if uniqueId is being updated and if it is already taken
    if (updates.uniqueId) {
      const existingUser = await User.findOne({ uniqueId: updates.uniqueId });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ message: "ID is already taken" });
      }
    }

    // Find user by ID and update with new data
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          bio: updates.bio,
          location: updates.location,
          occupation: updates.occupation,
          socialLinks: updates.socialLinks,
          // Keep existing uniqueId if not provided
          ...(updates.uniqueId && { uniqueId: updates.uniqueId })
        }
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* SEARCH */
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const sanitizedQuery = query.trim();
    const conditions = [
      { uniqueId: { $regex: sanitizedQuery, $options: "i" } },
      { firstName: { $regex: sanitizedQuery, $options: "i" } },
      { lastName: { $regex: sanitizedQuery, $options: "i" } },
    ];

    const users = await User.find({ $or: conditions })
      .select("-password")
      .limit(50); // Limit the number of results returned

    res.status(200).json(users);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "An error occurred while searching for users" });
  }
};
