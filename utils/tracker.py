import csv
import os
import time
import matplotlib.pyplot as plt

class BoltPerformanceTracker:
    def __init__(self, log_path="E:/rulebased_correction/session_log.csv"):
        self.log_path = log_path
        self.history = []
        self._initialize_log()

    def _initialize_log(self):
        """Creates the CSV file with headers if it doesn't exist."""
        if not os.path.exists(self.log_path):
            with open(self.log_path, mode='w', newline='') as file:
                writer = csv.writer(file)
                writer.writerow(["Timestamp", "Shot_Type", "Score", "Faults"])

    def add_entry(self, shot_type, score, alerts):
        """Logs a completed shot to the history and CSV."""
        if shot_type == "NONE" or shot_type == "PREPARATION":
            return

        timestamp = time.strftime("%H:%M:%S")
        faults_str = "|".join(alerts) if alerts else "None"
        
        entry = {
            "time": timestamp,
            "type": shot_type,
            "score": score,
            "faults": faults_str
        }
        
        self.history.append(entry)
        
        # Write to local disk immediately to prevent data loss
        with open(self.log_path, mode='a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow([timestamp, shot_type, score, faults_str])

    def get_session_summary(self):
        """Calculates statistics for the judges' summary."""
        if not self.history:
            return "No data collected yet."
        
        avg_score = sum(item['score'] for item in self.history) / len(self.history)
        total_shots = len(self.history)
        return f"Session Avg: {avg_score:.1f}% | Total Shots: {total_shots}"

    def plot_progress(self):
        """Generates a quick trend graph of the scores."""
        if len(self.history) < 2: return
        
        scores = [item['score'] for item in self.history]
        plt.figure(figsize=(6, 4))
        plt.plot(scores, marker='o', color='green')
        plt.title("Live Improvement Trend")
        plt.xlabel("Shot Number")
        plt.ylabel("BOLT Accuracy %")
        plt.savefig("E:/rulebased_correction/progress_chart.png")
        plt.close()