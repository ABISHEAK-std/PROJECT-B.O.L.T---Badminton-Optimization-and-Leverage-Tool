import cv2

def play_video(path: str) -> None:
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        print(f"Failed to open video: {path}")
        return

    print("Press 'q' to quit.")
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow("TestCV", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    video_path = r"E:\\batminton dataset\\multiple.mp4"
    play_video(video_path)
