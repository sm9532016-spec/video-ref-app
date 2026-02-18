import { VideoReference } from '@/types';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';

/**
 * Read all videos from storage
 */
export async function getAllVideos(): Promise<VideoReference[]> {
    await dbConnect();
    const videos = await Video.find({}).sort({ collectedAt: -1 }).lean();
    return JSON.parse(JSON.stringify(videos));
}

/**
 * Get a single video by ID
 */
export async function getVideoById(id: string): Promise<VideoReference | null> {
    await dbConnect();
    const video = await Video.findOne({ id }).lean();
    return video as unknown as VideoReference | null;
}

/**
 * Create a new video reference
 */
export async function createVideo(videoData: Omit<VideoReference, 'id' | 'collectedAt'>): Promise<VideoReference> {
    await dbConnect();

    // Check if video already exists (by URL)
    const existing = await Video.findOne({ videoUrl: videoData.videoUrl });
    if (existing) {
        throw new Error('Video already exists');
    }

    const newVideo = await Video.create({
        ...videoData,
        id: generateId(),
        collectedAt: new Date(),
    });

    return newVideo.toObject() as unknown as VideoReference;
}

/**
 * Update a video reference
 */
export async function updateVideo(id: string, updates: Partial<VideoReference>): Promise<VideoReference | null> {
    await dbConnect();
    const updatedVideo = await Video.findOneAndUpdate(
        { id },
        { $set: updates },
        { new: true }
    ).lean();

    return updatedVideo as unknown as VideoReference | null;
}

/**
 * Delete a video reference
 */
export async function deleteVideo(id: string): Promise<boolean> {
    await dbConnect();
    const result = await Video.deleteOne({ id });
    return result.deletedCount > 0;
}

/**
 * Generate a unique ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get videos by platform
 */
export async function getVideosByPlatform(platform: string): Promise<VideoReference[]> {
    await dbConnect();
    const videos = await Video.find({ platform }).sort({ collectedAt: -1 }).lean();
    return videos as unknown as VideoReference[];
}

/**
 * Get videos by date range
 */
export async function getVideosByDateRange(startDate: Date, endDate: Date): Promise<VideoReference[]> {
    await dbConnect();
    const videos = await Video.find({
        collectedAt: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ collectedAt: -1 }).lean();
    return videos as unknown as VideoReference[];
}

/**
 * Get videos collected today
 */
export async function getTodaysVideos(): Promise<VideoReference[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return getVideosByDateRange(today, tomorrow);
}
