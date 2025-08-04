#!/usr/bin/env python3

import json
import os
import sys
from pathlib import Path
from datetime import datetime

def log_tool_result(session_id, tool_name, tool_input, tool_response):
    """Log tool execution results."""
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / 'post_tool_use.json'
    
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
        "tool_name": tool_name,
        "tool_input": tool_input,
        "tool_response": tool_response,
        "success": tool_response.get('success', True) if isinstance(tool_response, dict) else True
    }
    
    log_data.append(log_entry)
    
    # Write log
    with open(log_file, 'w') as f:
        json.dump(log_data, f, indent=2)

def check_for_issues(tool_name, tool_response):
    """Check if the tool execution had any issues we should flag."""
    issues = []
    
    if tool_name == "Write" or tool_name == "Edit":
        # Check for migration files
        if isinstance(tool_response, dict):
            file_path = tool_response.get('file_path', '')
            if 'migration' in file_path:
                issues.append("📌 Remember to run migrations: supabase db push")
            if '.env' in file_path:
                issues.append("⚠️  Environment file modified - restart services if needed")
    
    elif tool_name == "Bash":
        # Check for specific command outputs
        if isinstance(tool_response, str):
            if "error" in tool_response.lower():
                issues.append("❌ Command may have failed - check output")
            if "supabase" in tool_response:
                issues.append("📌 Supabase command executed - verify RLS policies")
    
    return issues

def main():
    # Read input from stdin
    try:
        input_data = json.load(sys.stdin)
    except:
        print("Failed to parse input JSON", file=sys.stderr)
        sys.exit(1)
    
    session_id = input_data.get('session_id', 'unknown')
    tool_name = input_data.get('tool_name', '')
    tool_input = input_data.get('tool_input', {})
    tool_response = input_data.get('tool_response', {})
    
    # Log the result
    log_tool_result(session_id, tool_name, tool_input, tool_response)
    
    # Check for issues
    issues = check_for_issues(tool_name, tool_response)
    
    # Print any issues found
    for issue in issues:
        print(issue)
    
    # Special handling for database operations
    if tool_name == "Bash" and isinstance(tool_input, dict):
        command = tool_input.get('command', '')
        if 'supabase db' in command or 'psql' in command:
            print("💾 Database operation completed")
            print("Remember to test affected features")
    
    sys.exit(0)

if __name__ == "__main__":
    main()