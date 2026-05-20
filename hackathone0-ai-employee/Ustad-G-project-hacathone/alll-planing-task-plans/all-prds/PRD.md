# PRODUCT REQUIREMENTS DOCUMENT: UstadG (v2.0)
**Project Name:** UstadG (Ustad Ji) — AI Service Orchestrator
**Hackathon:** #AISeekho2026 Antigravity Hackathon (Challenge 2)
**Primary Build Tool:** Google Antigravity IDE (Gemini 3 Pro)
**Author:** Muhammad Ismail
**Date:** May 14, 2026

---

## 1. Executive Summary
UstadG is an Agentic AI application built entirely within **Google Antigravity IDE** to automate service discovery and booking for Pakistan’s informal economy. The system processes natural language requests in **Urdu, Roman Urdu, and English**, autonomously matches users with providers, and simulates real-world bookings.

---

## 2. Antigravity Configuration & Rules
These persistent instructions guide all agent behavior within the workspace.

### 2.1 Workspace Rules
* **Tech Stack:** Always use **FastAPI (Python)** for the backend and **React Native (Expo)** for the mobile frontend.
* **Language Support:** All user-facing text must support Urdu, Roman Urdu, and English.
* **Traceability:** Every agent decision must be logged with a timestamp, input, and output.
* **Persistence:** Write all booking records to **Google Sheets** via MCP with a unique confirmation ID.
* **Model:** Use **Gemini 3 Pro** for all reasoning and NLP tasks.

### 2.2 Specialized Skills
| Skill Name | Role / Functionality |
| :--- | :--- |
| `google-maps-integration` | Handles Places API setup and query patterns for Pakistani cities. |
| `google-sheets-booking` | Manages Sheets API setup and booking schema. |
| `urdu-nlp-prompts` | Provides Gemini templates for multilingual intent parsing. |
| `provider-ranking` | Implements the 40/40/20 weighted scoring formula. |

---

## 3. System Architecture
The application implements a **5-Step Agent Reasoning Pipeline**:

1.  **Intent Agent:** Extracts service, location, and time from raw user messages.
2.  **Discovery Agent:** Finds providers within a 10km radius using Google Maps.
3.  **Ranking Agent:** Scores providers based on Distance (40%), Rating (40%), and Availability (20%).
4.  **Booking Agent:** Generates ID (UGK-YYYY-XXXX) and records data to Google Sheets.
5.  **Follow-up Agent:** Schedules a simulated reminder 1 hour before the appointment.

---

## 4. Build Plan (7-Day Sprint)
| Day | Focus | Antigravity Instruction (Planning Mode) |
| :--- | :--- | :--- |
| **Day 1** | Setup | "Set up a FastAPI project called ustaadg-backend with 20 mock providers in Karachi." |
| **Day 2** | Intent | "Build an intent extraction endpoint to parse Roman Urdu using Gemini." |
| **Day 3** | Discovery | "Build a discovery endpoint that calls Google Maps and ranks providers." |
| **Day 4** | Booking | "Build a booking simulation that writes records to Google Sheets." |
| **Day 5** | Mobile UI | "Build a React Native app with chat, results, and confirmation screens." |
| **Day 6** | Follow-up | "Add a follow-up reminder and a developer Agent Trace screen." |
| **Day 7** | Polish | "Use the browser agent to record a full demo from input to confirmation." |

---

## 5. Submission Deliverables
* **Working Mobile App:** React Native APK.
* **Demo Video:** 3–5 minute Antigravity browser recording.
* **Agent Trace Logs:** Exported Antigravity Artifacts (JSON + MD).
* **Technical Docs:** README and Architecture diagrams.

---
**PRD Version:** 2.0 | **Author:** Muhammad Ismail | **Project:** #AISeekho2026
