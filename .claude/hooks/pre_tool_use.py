#!/usr/bin/env python3

import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime

# Farliga kommandon och mönster
DANGEROUS_PATTERNS = [
    r'rm\s+.*-[rf]',           # rm -rf varianter
    r'sudo\s+rm',              # sudo rm kommandon
    r'chmod\s+777',            # Farliga permissions
    r'>\s*/etc/',              # Skriva till systemkataloger
    r'DROP\s+TABLE',           # Farliga SQL-kommandon
    r'DROP\s+DATABASE',        # Databas-borttagning
    r'DELETE\s+FROM.*WHERE\s+1\s*=\s*1',  # DELETE utan WHERE
    r'TRUNCATE\s+TABLE',       # Tömma tabeller
]

# Känsliga filer som inte får läsas/ändras utan varning
SENSITIVE_FILES = [
    '.env',
    '.env.local',
    '.env.production',
    'supabase/seed.sql',
    'supabase/migrations/',
]

# Supabase RLS-relaterade mönster
RLS_PATTERNS = [
    r'ALTER\s+TABLE.*DISABLE\s+ROW\s+LEVEL\s+SECURITY',
    r'DROP\s+POLICY',
    r'CREATE\s+POLICY.*WITH\s+CHECK\s*\(\s*true\s*\)',  # För öppna policies
]

def is_dangerous_command(tool_name, tool_input):
    """Check if the command is potentially dangerous."""
    if tool_name == "Bash":
        command = tool_input.get('command', '')
        for pattern in DANGEROUS_PATTERNS:
            if re.search(pattern, command, re.IGNORECASE):
                return True, f"Dangerous pattern detected: {pattern}"
    
    elif tool_name in ["Write", "Edit", "MultiEdit"]:
        file_path = tool_input.get('file_path', '')
        for sensitive in SENSITIVE_FILES:
            if sensitive in file_path:
                return True, f"Attempting to modify sensitive file: {sensitive}"
    
    elif tool_name == "Read":
        file_path = tool_input.get('file_path', '')
        if any(sensitive in file_path for sensitive in ['.env', 'secrets']):
            # Varning men blockera inte läsning
            print(f"⚠️  Reading sensitive file: {file_path}", file=sys.stderr)
    
    return False, None

def check_database_safety(tool_name, tool_input):
    """Check for dangerous database operations."""
    if tool_name == "Bash":
        command = tool_input.get('command', '')
        for pattern in RLS_PATTERNS:
            if re.search(pattern, command, re.IGNORECASE):
                return True, f"Dangerous RLS operation detected: {pattern}"
    
    return False, None

def log_tool_use(session_id, tool_name, tool_input, blocked=False, reason=None):
    """Log all tool usage for audit."""
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / 'pre_tool_use.json'
    
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
        "blocked": blocked,
        "reason": reason
    }
    
    log_data.append(log_entry)
    
    # Write log
    with open(log_file, 'w') as f:
        json.dump(log_data, f, indent=2)

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
    
    # Check for dangerous commands
    is_dangerous, danger_reason = is_dangerous_command(tool_name, tool_input)
    if is_dangerous:
        log_tool_use(session_id, tool_name, tool_input, blocked=True, reason=danger_reason)
        print(f"🚫 BLOCKED: {danger_reason}", file=sys.stderr)
        print(f"Tool: {tool_name}", file=sys.stderr)
        print(f"This operation has been blocked for security reasons.", file=sys.stderr)
        sys.exit(2)  # Exit code 2 blocks the tool execution
    
    # Check for dangerous database operations
    is_db_dangerous, db_reason = check_database_safety(tool_name, tool_input)
    if is_db_dangerous:
        log_tool_use(session_id, tool_name, tool_input, blocked=True, reason=db_reason)
        print(f"🚫 BLOCKED: {db_reason}", file=sys.stderr)
        print(f"This database operation requires manual review.", file=sys.stderr)
        sys.exit(2)
    
    # Log successful tool use
    log_tool_use(session_id, tool_name, tool_input, blocked=False)
    
    # Special handling for certain tools
    if tool_name == "Bash" and "supabase" in tool_input.get('command', ''):
        print("📌 Reminder: Check RLS policies after schema changes")
    
    sys.exit(0)

if __name__ == "__main__":
    main()