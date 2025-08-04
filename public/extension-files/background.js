chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'API_REQUEST') {
    const { method, url, data } = request;
    
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({ success: true, data });
    })
    .catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  const guestUUID = generateUUID();
  chrome.storage.local.set({ 
    guestUUID: guestUUID,
    isRegistrationInProgress: false,
    pendingProduct: null
  });
  
  console.log("🔧 [Background] Extension kuruldu, guest UUID oluşturuldu:", guestUUID);
});

// Content script'e mesaj gönder
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_ACTIVE_UUID') {
    chrome.storage.local.get(['guestUUID', 'permanentUUID'], (result) => {
      const activeUUID = result.permanentUUID || result.guestUUID;
      sendResponse({ uuid: activeUUID, type: result.permanentUUID ? "permanent" : "guest" });
    });
    return true;
  }
  
  if (request.type === 'API_REQUEST') {
    const { method, url, data } = request;
    
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({ success: true, data });
    })
    .catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    
    return true;
  }
});

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 