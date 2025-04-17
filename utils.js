// --- FUNZIONI UTILITY ---
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function getRandomText(arr) { if (!arr || arr.length === 0) return ""; return arr[getRandomInt(0, arr.length - 1)]; }
function addMessage(msg, type = 'info', emphasize = false) {
     if(typeof msg !== 'string') msg = String(msg);
     const maxLogMsgLength = 70;
     let displayMsg = msg.length > maxLogMsgLength ? msg.substring(0, maxLogMsgLength) + '...' : msg;
     messages.unshift(`${emphasize ? '<span class="log-warning">': ''}> ${displayMsg}${emphasize ? '</span>' : ''}`);
     if (messages.length > MAX_MESSAGES) { messages.pop(); }
     renderMessages();
 } 