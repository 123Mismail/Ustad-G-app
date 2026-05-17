# UstadG (v2.0) Implementation Plan

This document breaks down the Product Requirements Document (PRD) into small, actionable features across the backend and frontend.

## 1. Backend: Core Setup & Models
**Goal:** Initialize the FastAPI project and define the data structures.
*   **`backend/main.py`**: FastAPI application entry point, route registration.
*   **`backend/models/schemas.py`**: Pydantic models for requests, responses, and Agent internal states.
*   **`backend/data/mock_providers.py`**: Script to load or define the 20 mock providers in Karachi.

## 2. Backend: Intent Agent
**Goal:** Process multilingual input (Urdu, Roman Urdu, English) to extract intent.
*   **`backend/agents/intent_agent.py`**: Agent logic to extract Service, Location, and Time.
*   **`backend/prompts/urdu_nlp.py`**: Prompt templates specifically designed for Gemini to handle local languages.
*   **`backend/services/gemini_service.py`**: Wrapper for interacting with the Gemini 3 Pro API.

## 3. Backend: Discovery & Ranking Agents
**Goal:** Find local providers and rank them based on the PRD's formula.
*   **`backend/agents/discovery_agent.py`**: Logic to query providers within a 10km radius.
*   **`backend/agents/ranking_agent.py`**: Implements the 40% Distance, 40% Rating, and 20% Availability scoring.
*   **`backend/services/maps_service.py`**: Google Maps Places API integration.

## 4. Backend: Booking & Follow-up Agents
**Goal:** Finalize the service booking and simulate follow-ups.
*   **`backend/agents/booking_agent.py`**: Generates `UGK-YYYY-XXXX` IDs and handles booking state.
*   **`backend/agents/followup_agent.py`**: Logic for the 1-hour simulated reminder.
*   **`backend/services/sheets_service.py`**: Google Sheets MCP integration for persistent records.

## 5. Frontend: React Native App Setup
**Goal:** Initialize the Expo application and routing.
*   **`frontend/App.js`**: Main entry point, theme provider, and global context.
*   **`frontend/navigation/AppNavigator.js`**: Stack navigator to switch between screens.
*   **`frontend/utils/i18n.js`**: Multilingual string dictionary for UI localization.

## 6. Frontend: User Interfaces
**Goal:** Build the interactive screens for the user and developer traces.
*   **`frontend/screens/ChatScreen.js`**: UI for users to type their natural language requests.
*   **`frontend/screens/ResultsScreen.js`**: Displays the ranked list of providers.
*   **`frontend/screens/ConfirmationScreen.js`**: Shows the final booking details and ID.
*   **`frontend/screens/AgentTraceScreen.js`**: Developer view to see timestamped agent decisions.
*   **`frontend/components/ProviderCard.js`**: Reusable component for displaying individual provider details.
