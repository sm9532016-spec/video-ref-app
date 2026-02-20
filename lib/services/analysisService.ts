import Groq from 'groq-sdk';
import { VideoAnalysis, VideoReference } from '@/types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

/**
 * Analyze a video using Groq AI
 */
export async function analyzeVideo(video: VideoReference): Promise<VideoAnalysis> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const prompt = createAnalysisPrompt(video);

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert video production analyst. Provide detailed, actionable analysis in JSON format only. ALL text content must be in Korean language.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5, // Lower temperature for more structured output
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    return parseAnalysisResponse(responseText, video.id);
  } catch (error) {
    console.error('Error analyzing video with Groq:', error);
    throw new Error('Failed to analyze video with Groq AI');
  }
}

function createAnalysisPrompt(video: VideoReference): string {
  return `
You are a video production expert. Analyze the following video for a creator audience.
Unlike typical reviews, focus purely on "production key points" and "replication techniques".

Video Info:
- Title: ${video.title}
- Platform: ${video.platform}
- Duration: ${video.duration}s
- URL: ${video.videoUrl}
- Description/Context:
${video.description || 'No description available.'}

---

**Step 1: Identify the Genre**
Choose ONE from: "Motion Graphics", "Advertisement", "Movie", "Media Art".

**Step 2: JSON Output**
Output valid JSON matching this exact structure. All values must be in Korean (except keys).

{
  "oneLineSummary": "Core concept in one line (Korean)",
  "timecodeAnalysis": [
    { "timestamp": "0:00-0:03", "content": "Hook", "productionPoint": "Eye-catching device description" },
    { "timestamp": "0:03-0:10", "content": "Development", "productionPoint": "Rhythm/Camera/Graphic description" }
    // Minimum 5 segments required
  ],
  "shotAnalysis": {
    "averageCutLength": "e.g., 2.5s",
    "shortestCut": "Description of shortest cut",
    "longestCut": "Description of longest cut",
    "rhythmPattern": "e.g., Fast start -> Slow middle -> Fast end"
  },
  "visualAnalysis": {
    "colorStrategy": "Color grading strategy description",
    "compositionRules": "Composition rules used",
    "spatialDepth": "How depth is expressed (Z-axis, blur, etc)",
    "textureExpress": "Texture/Grain usage"
  },
  "soundAnalysis": {
    "hasMusic": true,
    "soundEffectsRole": "Role of SFX (e.g., transition sync)",
    "silenceUsage": "How silence is used"
  },
  "replicationRecipe": {
    "recommendedTools": ["Tool 1", "Tool 2"],
    "keyFunctions": ["Function 1", "Function 2"],
    "settings": "Specific render/effect settings estimation",
    "difficultyPoint": "Most difficult part to replicate",
    "corePoints": ["Point 1", "Point 2", "Point 3"]
  },
  "genreSpecifics": {
    "genre": "Selected Genre Name (Motion Graphics | Advertisement | Movie | Media Art)",
    
    // IF Motion Graphics:
    "easePattern": "Graph feeling description",
    "loopStructure": "Loop description",
    "transitionTechniques": "Transition grammar",
    "moduleSystem": true/false,
    "rhythmSync": "Sync points",
    "speedChangeSegment": "Timecode for speed change",

    // IF Advertisement:
    "hookMechanism": "0-3s hook device",
    "brandAppearanceTiming": "Time of first logo/brand",
    "productCloseUpDuration": "Duration of product shots",
    "emotionToFunctionPoint": "Timecode/Description of shift from emotion to function",
    "ctaTiming": "CTA appearance time",
    "brandExposureDuration": "Total brand exposure duration in seconds",

    // IF Movie:
    "cameraMovement": "Camera move description per scene",
    "lensCharacteristics": "Lens feel (focal length etc)",
    "characterMovement": "Blocking description",
    "lightingContrast": "Lighting ratio/contrast change",
    "climaxTiming": "Time of emotional climax",
    "emotionShiftTiming": "Timecode of emotion shift",

    // IF Media Art:
    "spaceEstimation": "Estimated physical space dimensions from camera move",
    "loopLength": "Loop length time",
    "repetitionStructure": "Structure of repetition",
    "viewerPosition": "Estimated viewer interaction position",
    "contrastChangeSegment": "Section with brightness/color contrast change",
    "spaceRecognitionSegment": "Timecode where space structure is clearest"
  },
  "learningPoints": {
    "experiments": ["Experiment 1", "Experiment 2", "Experiment 3"],
    "difficultyLevel": "Low" | "Medium" | "High",
    "difficultyReason": "Reason for difficulty",
    "mustWatchPoint": "One absolute must-watch point"
  },
  "overallScore": 1-10, // production quality score
  "keyTakeaways": ["Summary point 1", "Summary point 2"] // General summary
}

**Important**:
- Fill ONLY the fields relevant to the selected genre in "genreSpecifics".
- Ensure "timecodeAnalysis" has at least 5 meaningful segments.
- "replicationRecipe" is the most important section. Be specific about software/tools (AE, C4D, Premiere, Blender, etc.).
`;
}

function parseAnalysisResponse(responseText: string, videoId: string): VideoAnalysis {
  try {
    // Clean up the response text (remove markdown code blocks if present)
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);

    return {
      id: `analysis-${Date.now()}`,
      videoId: videoId,
      oneLineSummary: parsed.oneLineSummary || '분석 결과 없음',
      timecodeAnalysis: Array.isArray(parsed.timecodeAnalysis) ? parsed.timecodeAnalysis : [],
      shotAnalysis: parsed.shotAnalysis || { averageCutLength: '-', shortestCut: '-', longestCut: '-', rhythmPattern: '-' },
      visualAnalysis: parsed.visualAnalysis || { colorStrategy: '-', compositionRules: '-', spatialDepth: '-', textureExpress: '-' },
      soundAnalysis: parsed.soundAnalysis || { hasMusic: false, soundEffectsRole: '-', silenceUsage: '-' },
      replicationRecipe: parsed.replicationRecipe || { recommendedTools: [], keyFunctions: [], settings: '-', difficultyPoint: '-', corePoints: [] },
      genreSpecifics: parsed.genreSpecifics || { genre: 'Motion Graphics' }, // Default
      learningPoints: parsed.learningPoints || { experiments: [], difficultyLevel: 'Medium', difficultyReason: '-', mustWatchPoint: '-' },
      overallScore: parsed.overallScore || 5,
      keyTakeaways: parsed.keyTakeaways || [],
      createdAt: new Date(),

      // Legacy mapping for compatibility if needed (optional)
      hookAnalysis: { description: '-', effectiveness: 0, techniques: [], timestamp: 0 },
      colorGrading: { dominantColors: [], mood: '-', colorPalette: '-', techniques: [] },
      transitions: { types: [], frequency: 'medium', effectiveness: 0, examples: [] },
      audio: { mood: '-', voiceover: false, soundEffects: false, effectiveness: 0 },
      visualEffects: { types: [], quality: 'medium', purpose: '-' },
      storytelling: { structure: '-', narrative: '-', emotionalArc: '-', effectiveness: 0 },
      callToAction: { present: false }
    } as VideoAnalysis; // Cast to satisfy strict type checking if legacy fields are missing in type definition but present in logic
  } catch (e) {
    console.error("Analysis parse error", e);
    return createFallbackAnalysis(videoId);
  }
}

function createFallbackAnalysis(videoId: string): VideoAnalysis {
  return {
    id: `analysis-fail-${Date.now()}`,
    videoId: videoId,
    oneLineSummary: '분석에 실패했습니다. 다시 시도해주세요.',
    timecodeAnalysis: [],
    shotAnalysis: { averageCutLength: '-', shortestCut: '-', longestCut: '-', rhythmPattern: '-' },
    visualAnalysis: { colorStrategy: '-', compositionRules: '-', spatialDepth: '-', textureExpress: '-' },
    soundAnalysis: { hasMusic: false, soundEffectsRole: '-', silenceUsage: '-' },
    replicationRecipe: { recommendedTools: [], keyFunctions: [], settings: '-', difficultyPoint: '-', corePoints: [] },
    genreSpecifics: { genre: 'Motion Graphics' },
    learningPoints: { experiments: [], difficultyLevel: 'Medium', difficultyReason: '-', mustWatchPoint: '-' },
    overallScore: 0,
    keyTakeaways: [],
    createdAt: new Date(),
    // Legacy fields for type safety
    hookAnalysis: { description: '-', effectiveness: 0, techniques: [], timestamp: 0 },
    colorGrading: { dominantColors: [], mood: '-', colorPalette: '-', techniques: [] },
    transitions: { types: [], frequency: 'medium', effectiveness: 0, examples: [] },
    audio: { mood: '-', voiceover: false, soundEffects: false, effectiveness: 0 },
    visualEffects: { types: [], quality: 'medium', purpose: '-' },
    storytelling: { structure: '-', narrative: '-', emotionalArc: '-', effectiveness: 0 },
    callToAction: { present: false }
  } as VideoAnalysis;
}
