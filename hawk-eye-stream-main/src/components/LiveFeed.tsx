import { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity } from './ActivityCard';
import { Camera, CameraOff, Activity as ActivityIcon, Wifi, WifiOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// ... (Interface declarations for LiveFeedProps and Activity remain the same)

export const LiveFeed = ({ onActivityDetected, isActive, onToggleActive }: LiveFeedProps) => {
    const webcamRef = useRef<Webcam>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [currentActivity, setCurrentActivity] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [frameCount, setFrameCount] = useState(0);
    // 🆕 State for the annotated frame from the backend
    const [annotatedFrameUrl, setAnnotatedFrameUrl] = useState<string | null>(null); 
    const { toast } = useToast();

    // ✅ Send frame to FastAPI backend for YOLO detection
    const detectActivity = useCallback(async (imageData: string) => {
        try {
            // Convert base64 -> Blob (This part remains the same)
            const byteString = atob(imageData.split(',')[1]);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const intArray = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
                intArray[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('file', blob, 'frame.jpg');

            // 🔗 FastAPI endpoint
            const res = await axios.post('http://127.0.0.1:8000/api/frame', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const data = res.data;

            // 🆕 Update the annotated frame display
            if (data.annotated_frame && data.frame_type) {
                // Construct the data URL for the annotated image
                const imageUrl = `data:${data.frame_type};base64,${data.annotated_frame}`;
                setAnnotatedFrameUrl(imageUrl);
            } else {
                 setAnnotatedFrameUrl(null); // Clear if frame isn't returned
            }

            // ... (Detection and Toast Logic remains the same)
            if (data.detections && data.detections.length > 0) {
                // Take the top detection
                const top = data.detections[0];
                const activity: Activity = {
                    id: `activity_${Date.now()}_${Math.random()}`,
                    name: top.class_name,
                    timestamp: new Date().toISOString(),
                    severity:
                        top.class_name.toLowerCase().includes("fight") ||
                        top.class_name.toLowerCase().includes("weapon")
                            ? "critical"
                            : "info",
                    confidence: top.conf,
                };

                setCurrentActivity(activity.name);
                onActivityDetected(activity);

                if (activity.severity === "critical") {
                    toast({
                        title: "🚨 Critical Activity Detected!",
                        description: `${activity.name} (${Math.round(activity.confidence * 100)}% confidence)`,
                        variant: "destructive",
                    });

                    // Optional alert sound
                    try {
                        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQr+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGp+DyvmwmAzOl+7LfewAsIWt1aXONdYy4tZ0wOX2yTbtddjv7tHlNZNc9Sm9JNzBXLtI0ZWdrHRYfIYNjWl5CNRJGRzw2GdLGh0qMMfhBOE4bNNi1DxI+bCnLRbOLhzXCYjQtX8w6ZZRf+qMRSPCJvIRnHX7H9w==');
                        audio.play().catch(() => {});
                    } catch {}
                }
            } else {
                // If no detection, clear current activity but keep displaying the frame
                setCurrentActivity(null); 
            }

            setIsConnected(true);
        } catch (error) {
            console.error('Error detecting activity:', error);
            setIsConnected(false);
            setAnnotatedFrameUrl(null); // Clear frame on error
            toast({
                title: "Connection Error",
                description: "Failed to connect to detection service",
                variant: "destructive",
            });
        }
    }, [onActivityDetected, toast]);

    // ... (captureFrame and useEffect remain the same)
    const captureFrame = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setFrameCount(prev => prev + 1);
            detectActivity(imageSrc);
        }
    }, [detectActivity]);

    useEffect(() => {
        if (isActive) {
            // NOTE: The Webcam component must be present in the DOM for `getScreenshot()` to work.
            // We'll keep it rendered but hidden if we switch to displaying the annotated frame.
            intervalRef.current = setInterval(captureFrame, 1000); // every 2s
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setCurrentActivity(null);
            setAnnotatedFrameUrl(null); // Clear displayed image when stopping feed
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, captureFrame]);
    
    // ... (videoConstraints remains the same)
    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    return (
        <Card className="p-6 bg-gradient-to-br from-card to-secondary/20 border-border">
            {/* ... (Header remains the same) ... */}
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Camera className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Live Surveillance Feed</h2>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
                        {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                    <Button
                        onClick={onToggleActive}
                        variant={isActive ? "destructive" : "default"}
                        className="gap-2"
                    >
                        {isActive ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                        {isActive ? 'Stop Feed' : 'Start Feed'}
                    </Button>
                </div>
            </div>

            <div className="relative rounded-lg overflow-hidden bg-secondary/50">
                {/* 🆕 Conditionally render the webcam (hidden) or the annotated frame (visible) */}
                {isActive ? (
                    <>
                        {/* 1. The Webcam component must be present and running to take screenshots */}
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            height={400}
                            screenshotFormat="image/jpeg"
                            width="100%"
                            videoConstraints={videoConstraints}
                            className="w-full h-auto absolute top-0 left-0 opacity-0 pointer-events-none" // 🛑 Hidden!
                            style={{ zIndex: -1 }} 
                        />
                        
                        {/* 2. The Annotated Image is what the user sees */}
                        {annotatedFrameUrl ? (
                            <img 
                                src={annotatedFrameUrl} 
                                alt="Annotated Live Feed" 
                                className="w-full h-auto object-cover" 
                                style={{ height: 400 }} // Match the webcam height for consistency
                            />
                        ) : (
                            // Fallback while waiting for the first frame/initial loading
                             <div className="flex items-center justify-center h-64 bg-secondary/20">
                                <p className="text-lg text-muted-foreground">Loading feed...</p>
                            </div>
                        )}
                    </>
                ) : (
                    // Initial "Start Feed" message
                    <div className="flex items-center justify-center h-64 bg-secondary/20">
                        <div className="text-center">
                            <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg text-muted-foreground">Click "Start Feed" to begin monitoring</p>
                        </div>
                    </div>
                )}

                {/* Activity Overlay and Frame Counter (remain the same) */}
                {currentActivity && isActive && (
                    <div className="absolute top-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <ActivityIcon className="h-5 w-5 text-primary animate-pulse" />
                            <span className="text-lg font-semibold text-white">
                                Detected: {currentActivity}
                            </span>
                        </div>
                    </div>
                )}

                {isActive && (
                    <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="text-sm text-white">
                            Frames: {frameCount}
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );
};