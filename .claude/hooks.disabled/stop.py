#!/usr/bin/env python3

import json
import os
import sys
import random
from pathlib import Path
from datetime import datetime

def get_completion_messages():
    """Return context-aware completion messages."""
    messages = [
        "✅ Uppgift slutförd!",
        "🎯 Klart och färdigt!",
        "💪 Bra jobbat!",
        "🏁 Task completed successfully!",
        "👍 Allt klart!"
    ]
    return random.choice(messages)

def get_next_step_suggestion():
    """Suggest next steps based on time of day."""
    hour = datetime.now().hour
    
    if hour < 12:
        return "☕ Kolla nästa uppgift med 'task-master next'"
    elif hour < 17:
        return "📋 Fortsätt med 'task-master next' för nästa task"
    else:
        return "🌙 Bra jobbat idag! Kolla 'task-master list' för översikt"

def log_stop_event(session_id, input_data):
    """Log stop event."""
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / 'stop.json'
    
    # Read existing log data
    if log_file.exists():
        with open(log_file, 'r') as f:
            try:
                log_data = json.load(f)
            except:
                log_data = []
    else:
        log_data = []
    
    # Create log entry
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "session_id": session_id,
        "completion_message": get_completion_messages(),
        "input_data": input_data
    }
    
    log_data.append(log_entry)
    
    # Write log
    with open(log_file, 'w') as f:
        json.dump(log_data, f, indent=2)

def main():
    # Parse command line arguments
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--chat', action='store_true', help='Save chat transcript')
    args = parser.parse_args()
    
    # Read input from stdin
    try:
        input_data = json.load(sys.stdin)
    except:
        input_data = {}
    
    session_id = input_data.get('session_id', 'unknown')
    stop_hook_active = input_data.get('stop_hook_active', False)
    
    # Log the stop event
    log_stop_event(session_id, input_data)
    
    # Don't create infinite loops
    if stop_hook_active:
        sys.exit(0)
    
    # Print completion message
    completion_msg = get_completion_messages()
    next_step = get_next_step_suggestion()
    
    print("\n" + "="*50)
    print(completion_msg)
    print(next_step)
    print("="*50 + "\n")
    
    # Try to speak the completion message
    try:
        import subprocess
        subprocess.run(['say', completion_msg], check=False)
    except:
        pass  # Silently fail if TTS not available
    
    # Save chat transcript if requested
    if args.chat:
        try:
            # This would save the chat transcript if available
            # For now, just log that we would save it
            print("📝 Session logged to logs/")
        except:
            pass
    
    sys.exit(0)

if __name__ == "__main__":
    main()