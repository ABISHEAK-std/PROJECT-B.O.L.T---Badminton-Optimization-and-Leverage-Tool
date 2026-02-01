import ollama
import json
import datetime

class RagCoach:
    def __init__(self, user_height_cm=175):
        """
        Manages the player's physical parameters to customize RAG feedback.
        :param user_height_cm: The player's height in centimeters.
        """
        self.user_height = user_height_cm
        # Calculate theoretical max reach (approx 135% of height for a badminton player jumping)
        self.max_reach_height = self.user_height * 1.35  
        self.last_advice = ""
        self.cooldown = 0

    def generate_feedback(self, pose_name, current_metrics, retrieved_manual_text):
        """
        Generates advice that specifically references the user's height/reach.
        """
        # 1. Check if the error is related to 'Reach' or 'Extension'
        #    If so, we inject the height data into the prompt.
        reach_context = ""
        current_reach = current_metrics.get("reach_cm", 0)
        
        if "reach" in str(current_metrics).lower() or "extension" in str(current_metrics).lower():
            reach_defecit = self.max_reach_height - current_reach
            if reach_defecit > 20:
                reach_context = f"""
                [PLAYER PHYSIOLOGY]
                - Height: {self.user_height}cm
                - Theoretical Max Reach: ~{int(self.max_reach_height)}cm
                - Current Reach: {int(current_reach)}cm (Deficit: {int(reach_defecit)}cm)
                *NOTE: Remind the player they are tall enough to hit this steeper.*
                """
            
        # 2. Construct the Height-Aware Prompt
        prompt = f"""
        [ROLE]
        You are a BWF Badminton Coach. Speak briefly and urgently.

        [CONTEXT]
        Shot: {pose_name}
        Manual Rule: {retrieved_manual_text}
        
        {reach_context}

        [METRICS]
        {json.dumps(current_metrics)}

        [TASK]
        Provide 1 sentence of corrective feedback. 
        If specific height data is provided above, use it to motivate them (e.g., "At 180cm, you should be reaching X!").
        """

        # 3. Call Local LLM
        try:
            response = ollama.chat(model='llama3.2', messages=[{'role': 'user', 'content': prompt}])
            advice = response['message']['content']
            
            # Timestamp the advice for the logs
            timestamp = datetime.datetime.now().strftime("%H:%M:%S")
            return f"[{timestamp}] {advice}"
            
        except Exception as e:
            return f"Error generating advice: {e}"

# Usage Example:
if __name__ == "__main__":
    # Initialize coach with a specific height (e.g., 180cm)
    my_coach = RagCoach(user_height_cm=180)
    
    # Simulate a "Low Reach" Smash
    dummy_data = {"elbow_angle": 145, "reach_cm": 200, "status": "Low Extension"}
    dummy_rule = "The arm must be fully extended at impact."
    
    print(my_coach.generate_feedback("SMASH", dummy_data, dummy_rule))