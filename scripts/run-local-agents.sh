#!/bin/bash
# Run all Azure DevOps agents in tmux panes

SESSION="azagents"

# Kill existing session if it exists
tmux kill-session -t $SESSION 2>/dev/null

# Create new session with first agent
tmux new-session -d -s $SESSION -n agents "cd ~/azagent && ./run.sh"

# Split and add second agent
tmux split-window -h -t $SESSION "cd ~/azagent2 && ./run.sh"

# Attach to the session
tmux attach -t $SESSION
