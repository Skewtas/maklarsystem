#!/usr/bin/env python3

import json
import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime

def get_git_status():
    """Get current git status."""
    try:
        result = subprocess.run(['git', 'status', '--porcelain'], 
                              capture_output=True, text=True, check=True)
        return result.stdout.strip() if result.stdout else "Clean working directory"
    except:
        return "Not a git repository"

def get_task_master_status():
    """Get current Task Master status if available."""
    try:
        result = subprocess.run(['task-master', 'next'], 
                              capture_output=True, text=True, check=True)
        return result.stdout.strip() if result.stdout else "No pending tasks"
    except:
        return "Task Master not available"

def load_project_context():
    """Load important project context."""
    context_items = []
    
    # Check for important files
    important_files = [
        '.env.local',
        'maklarsystem/src/lib/supabase.ts',
        'CLAUDE.md',
        '.taskmaster/tasks/tasks.json'
    ]
    
    for file in important_files:
        if Path(file).exists():
            context_items.append(f"✓ {file} exists")
        else:
            context_items.append(f"✗ {file} missing")
    
    return "\n".join(context_items)

def main():
    # Read input from stdin
    try:
        input_data = json.load(sys.stdin)
    except:
        input_data = {}
    
    session_id = input_data.get('session_id', 'unknown')
    source = input_data.get('source', 'unknown')
    timestamp = datetime.now().isoformat()
    
    # Log session start
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / 'session_start.json'
    
    # Read existing log data or initialize
    if log_file.exists():
        with open(log_file, 'r') as f:
            try:
                log_data = json.load(f)
            except:
                log_data = []
    else:
        log_data = []
    
    # Append session data
    log_entry = {
        "timestamp": timestamp,
        "session_id": session_id,
        "source": source,
        "input_data": input_data
    }
    log_data.append(log_entry)
    
    # Write log
    with open(log_file, 'w') as f:
        json.dump(log_data, f, indent=2)
    
    # Generate welcome message based on source
    if source == "startup":
        print("=== Mäklarsystem Development Session Started ===")
        print(f"Session ID: {session_id}")
        print(f"Time: {timestamp}")
        print("\n📋 Project Status:")
        print(load_project_context())
        print("\n🔀 Git Status:")
        print(get_git_status())
        print("\n📝 Task Master:")
        print(get_task_master_status())
        print("\n💡 Tips:")
        print("• Use /agents to see available agents")
        print("• task-master next for next task")
        print("• Remember: Swedish real estate terms!")
        print("===========================================")
    elif source == "resume":
        print("=== Resuming Mäklarsystem Session ===")
        print(f"Session resumed at: {timestamp}")
        print("=====================================")
    elif source == "clear":
        print("=== Session Cleared ===")
        print("Starting fresh context")
        print("======================")
    
    sys.exit(0)

if __name__ == "__main__":
    main()