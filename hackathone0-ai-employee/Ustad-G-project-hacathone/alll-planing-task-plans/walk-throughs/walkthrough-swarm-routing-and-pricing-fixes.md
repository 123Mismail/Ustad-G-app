# Walkthrough — Swarm Routing, Pricing Consistency, Timezone, and Beta Provider Notification Fixes 🚀

This document details the analysis and proposed solutions to resolve the routing loops, pricing inconsistencies, missed reminder notifications, and the addition of beta provider alerts within the UstadG Agent Swarm.

---

## 1. Problem Statement

During user testing, four critical flaws and features were identified:

### Issue A: Swarm Reset / Routing Loop
- **Symptom**: When the user explicitly agrees to a pricing offer (e.g., saying `"yes confirmed book it"` or `"yes confimr it"`), the swarm resets back to the initial step and prints the list of available providers again, instead of completing the booking.
- **Root Cause**: The `TriageAgent` (root) executes first on every turn. Without explicit rules for ongoing conversations, it passed control to `DiscoveryAgent`. In turn, `DiscoveryAgent` saw the service category in the message history, called `search_local_providers`, and printed the list of providers again, instead of passing control to `NegotiationAgent` or `BookingAgent`.

### Issue B: Pricing & Provider Selection Leakage (Stale Context)
- **Symptom**: If the user has multiple negotiation attempts in a single session (e.g., negotiating one provider at 1,500 PKR, resetting, and then booking a second provider at 800 PKR), the final booking uses the stale price (`1,500 PKR`) from the previous attempt.
- **Root Cause**: The swarm history kept both price negotiations. When delegating to the `BookingAgent`, the `NegotiationAgent` failed to isolate only the *most recent* agreed price and provider, leading to pricing context leakage.

### Issue C: Missing / Delayed Reminder Notifications (Timezone Shift)
- **Symptom**: The 1-minute departing reminder notification does not appear at the correct local time.
- **Root Cause**: In `Backend/app/routers/chat.py`, when a booking is intercepted, the backend converts the naive parsed time (e.g. `2:12 PM`) using the server's local timezone offset (`datetime.now().astimezone().utcoffset()`). Since cloud servers run in UTC, the offset is 0, causing the backend to save the appointment as `14:12 UTC`. When serialized to the frontend, this shifts the appointment 5 hours into the future (Pakistan Time: `19:12` or 7:12 PM). Thus, the reminder is scheduled to fire hours late.
- **Hardcoded Body**: Additionally, the scheduler reminder notification body had a hardcoded time of `10:00 AM` instead of using the dynamically parsed appointment time.

### Issue D: Missing Provider Communication & Arrival/Departure Alerts (Beta Version Alert)
- **Question**: Once the booking is confirmed, how does the provider get notified of the booking details, customer details, and schedule to arrive on time?
- **Root Cause**: The current implementation has notification hooks *only* for the customer (the user initiating the chat). The provider receives no communication.
- **Beta Solution**: For beta testing, we will print a simulated SMS alert directly in the backend terminal console when a booking is confirmed. No active FCM push alerts or scheduled jobs will be created for the provider for now.

---

## 2. Proposed Changes & Optimizations

We are updating the prompts/instructions of the agents, the backend time-parsing logic, and introducing a beta provider alert engine.

### A. Triage Agent (`Backend/app/agents/triage.py`)
- **Addition**: Add an `ACTIVE CONVERSATION BYPASS` rule. If the user is responding to a price counter-offer, selecting a provider, or saying `"yes"`, `"confirm"`, or `"book it"`, the `TriageAgent` must immediately and silently delegate the context to `DiscoveryAgent` rather than greeting the user or resetting the state.

### B. Discovery Agent (`Backend/app/agents/discovery.py`)
- **Addition**: Add a `BYPASS RULE`. If the user has already selected a provider, is negotiating price, or is agreeing/confirming a booking, the agent **MUST NOT** perform a local database search or display the provider list. It must instantly and silently delegate the entire context to the `NegotiationAgent`.

### C. Negotiation Agent (`Backend/app/agents/negotiation.py`)
- **Additions**:
  1. **Direct Handoff**: Once the user agrees to the price, hand off to `BookingAgent` immediately.
  2. **Isolate Recent Turn**: Strictly extract the price and provider from the *most recent turn* in the history. Ignore previous aborted, changed, or separate booking attempts.
  3. **Range to Single Value Conversion**: When the user agrees to a range (e.g., `800–1,200`), select a single concrete value (e.g., midpoint `1,000` or upper limit `1,200`) to pass to the `BookingAgent` as the final agreed price.

### D. Backend Timezone & Beta Provider Alert Engine (`Backend/app/routers/chat.py` & `book.py`)
- **Timezone Correction**: Explicitly parse and schedule the time in the Pakistan timezone (UTC+5) rather than using the server's timezone.
- **Beta Simulated SMS / WhatsApp Alert for Provider**: 
  - Look up the `Provider` object in the Postgres database using the booked `provider_name` or `provider_id`.
  - Print a detailed simulated SMS containing the customer's name, phone number, address, and scheduled time to the console. No push alerts or jobs are created for providers.
- **Dynamic Body Time**: Format the scheduled reminder body dynamically:
```python
appointment_str = scheduled_local.strftime("%I:%M %p")
body = f"{provider_name} is heading your way. Appointment at {appointment_str}."
```

---

## 3. Verification Steps
1. Initiate Plumber search in Gulshan.
2. Select **Ali Plumber Services** -> Counter-offer price.
3. Agree to price and confirm.
4. Verify the agent completes the booking and returns the UGK confirmation code.
5. Check backend logs: Verify that `📢 [BETA] [SMS PROVIDER ALERT]` prints to the terminal with the correct customer location, telephone, and schedule details.
6. Verify that the scheduled notification triggers exactly 1 minute before the service for the customer (or in 5 seconds if testing/past).
