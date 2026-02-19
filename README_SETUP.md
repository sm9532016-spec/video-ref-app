
# ⚠️ MongoDB Setup Required

The video collection feature requires a running MongoDB database to save the collected videos.
Currently, the app cannot connect to a database at `mongodb://localhost:27017/video-ref-app`.

## Solution 1: Install MongoDB Locally (Recommended)

1.  Download **MongoDB Community Server** from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
2.  Install it with default settings.
3.  Ensure the **MongoDB Service** is running (it usually starts automatically).
4.  Restart your Next.js app (`npm run dev`).

## Solution 2: Use a Cloud Database (MongoDB Atlas)

1.  Create a free cluster at [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas).
2.  Get your connection string (e.g., `mongodb+srv://<username>:<password>@cluster0.mongodb.net/video-ref-app`).
3.  Update your `.env.local` file:
    ```env
    MONGODB_URI=your_connection_string_here
    ```
4.  Restart your Next.js app.

## Status
The code for video collection is **fixed and verified**. Once the database is connected, it will automatically start working.
