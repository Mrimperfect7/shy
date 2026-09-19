#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Still the 3d model is disturbing make a perfect one. A perfect 3d parts."
frontend:
  - task: "Continuous anatomical display hand, wrist, fingers and neck/shoulders"
    implemented: true
    working: true
    file: "frontend/components/customizer/Mannequin.tsx; frontend/scripts/generate-body-models.mjs"
    stuck_count: 1
    priority: high
    needs_retesting: false
    status_history:
      - working: false
        agent: user
        comment: "Existing separate primitive parts still look disturbing."
      - working: NA
        agent: main
        comment: "Replaced disconnected primitives with one code-sculpted continuous hand GLB, five tapered fingers/nails, wrist transition and a closed elliptical neck/shoulder mesh. Seven named anchors baked into asset."
  - task: "Responsive model framing and jewelry regression"
    implemented: true
    working: true
    file: "frontend/components/customizer/TryOnScene.tsx; JewelryCustomizer.tsx; WornItemsPanel.tsx; frontend/components/layout/StorefrontLayout.tsx"
    stuck_count: 0
    priority: high
    needs_retesting: false
    status_history:
      - working: NA
        agent: main
        comment: "Bounds-fit cameras on desktop/mobile, smoother neutral lighting, inactive display hidden, no sparkle/extra selection ring, reset view, collapsing panel on desktop too. Corrected double header offset and mobile viewport split; showroom excludes unrelated promotional overlays/footer. Cart/product data unchanged."
metadata:
  created_by: main_agent
  version: "1.0"
  test_sequence: 1
  run_ui: true
test_plan:
  current_focus:
    - "Validate all three body views visually, all five finger anchors, wrist stacking and necklace drape"
    - "Mobile layout and panel expansion/collapse; camera orbit/zoom/reset; cart product ID regression"
  stuck_tasks: []
  test_all: false
  test_priority: high_first
agent_communication:
  - agent: main
    message: "Test production build at current REACT_APP_BACKEND_URL. No auth changes, no AI/integrations. Please inspect actual model visuals, not only DOM. Existing stock jewelry GLBs are code-generated previews, not scanned product replicas. Models are local. Save screenshots for wrist/ring/neck on desktop and mobile; report any clipping or disconnected geometry."

  - agent: main
    message: "Iteration 1 follow-up: reproduced NK201 chain occlusion against upper chest; adjusted bust front profile so all existing necklace curves and the lariat clear the surface without altering product meshes. Mobile ring framing now contains full hand/forearm, showroom announcement bar removed with correctly resized header/viewport. panel-collapse was verified present in the expanded DOM (iteration-1 selector concern came from collapsed state); added aria-expanded labels. Required GLB nodes are validated inside error boundary. Please retest visual fixes and save real accessible screenshot artifacts plus repeatable tests."

  - agent: main
    message: "Completed: testing-agent iterations 1/2 passed body views, ring selection, stacking, persistence, cart, mobile panel and layout. Final targeted screenshot verification (iteration_3.json) passed angled necklace fit after 0.02 forward anchor clearance adjustment, panel selector round trip, and reset. Prior false-positive selector reports documented in regression notes. User visual approval remains pending."
