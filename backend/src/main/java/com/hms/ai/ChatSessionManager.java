package com.hms.ai;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpSession;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

public class ChatSessionManager {

    private static final String SESSION_KEY = "IRYO_CHAT_HISTORY";
    private static final String LEGACY_SESSION_KEY = "SAKURA_CHAT_HISTORY";
    private static final int MAX_HISTORY_TURNS = 10;

    public static class ChatTurn implements Serializable {
        private static final long serialVersionUID = 1L;
        private final String role; // "user" or "model"
        private final String content;
        private final long timestamp;

        public ChatTurn(String role, String content) {
            this.role = role;
            this.content = content;
            this.timestamp = System.currentTimeMillis();
        }

        public String getRole() { return role; }
        public String getContent() { return content; }
        public long getTimestamp() { return timestamp; }
    }

    @SuppressWarnings("unchecked")
    public static synchronized List<ChatTurn> getHistory(HttpSession session) {
        if (session == null) {
            return new ArrayList<>();
        }
        Object obj = session.getAttribute(SESSION_KEY);
        if (obj instanceof List<?>) {
            return (List<ChatTurn>) obj;
        }
        Object legacyObj = session.getAttribute(LEGACY_SESSION_KEY);
        if (legacyObj instanceof List<?>) {
            return (List<ChatTurn>) legacyObj;
        }
        List<ChatTurn> list = new ArrayList<>();
        session.setAttribute(SESSION_KEY, list);
        return list;
    }

    public static synchronized void addTurn(HttpSession session, String role, String content) {
        if (session == null || content == null || content.trim().isEmpty()) {
            return;
        }
        List<ChatTurn> history = getHistory(session);
        history.add(new ChatTurn(role, content.trim()));

        // Keep rolling window
        while (history.size() > MAX_HISTORY_TURNS) {
            history.remove(0);
        }
        session.setAttribute(SESSION_KEY, history);
    }

    public static synchronized void clearHistory(HttpSession session) {
        if (session != null) {
            session.removeAttribute(SESSION_KEY);
        }
    }

    /**
     * Builds alternating Gemini contents array including session history and current message.
     */
    public static JsonArray buildGeminiContents(HttpSession session, String currentMessage) {
        JsonArray contents = new JsonArray();
        List<ChatTurn> history = getHistory(session);

        String expectedRole = "user";
        for (ChatTurn turn : history) {
            if (turn.getRole().equals(expectedRole)) {
                JsonObject contentObj = new JsonObject();
                contentObj.addProperty("role", turn.getRole());
                JsonArray parts = new JsonArray();
                JsonObject part = new JsonObject();
                part.addProperty("text", turn.getContent());
                parts.add(part);
                contentObj.add("parts", parts);
                contents.add(contentObj);

                expectedRole = expectedRole.equals("user") ? "model" : "user";
            }
        }

        // Add the current user turn
        JsonObject currentObj = new JsonObject();
        currentObj.addProperty("role", "user");
        JsonArray curParts = new JsonArray();
        JsonObject curPart = new JsonObject();
        curPart.addProperty("text", currentMessage);
        curParts.add(curPart);
        currentObj.add("parts", curParts);
        contents.add(currentObj);

        return contents;
    }

    /**
     * Builds standard OpenAI / NVIDIA chat completions messages array
     * including system prompt, multi-turn history, and current user message.
     */
    public static JsonArray buildOpenAIMessages(HttpSession session, String currentMessage, String systemPrompt) {
        JsonArray messages = new JsonArray();

        if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
            JsonObject sysObj = new JsonObject();
            sysObj.addProperty("role", "system");
            sysObj.addProperty("content", systemPrompt.trim());
            messages.add(sysObj);
        }

        List<ChatTurn> history = getHistory(session);
        for (ChatTurn turn : history) {
            JsonObject turnObj = new JsonObject();
            // Map "model" to "assistant" for OpenAI compatibility
            String role = "model".equalsIgnoreCase(turn.getRole()) ? "assistant" : "user";
            turnObj.addProperty("role", role);
            turnObj.addProperty("content", turn.getContent());
            messages.add(turnObj);
        }

        JsonObject curObj = new JsonObject();
        curObj.addProperty("role", "user");
        curObj.addProperty("content", currentMessage);
        messages.add(curObj);

        return messages;
    }
}
