export default defineBackground(() => {
  console.log("Heybe Extension Background Script Started", {
    id: browser.runtime.id,
  });

  // API istekleri için message handler
  browser.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.type === "API_REQUEST") {
        try {
          const { endpoint, options } = message;
          const response = await fetch(`http://localhost:3000/api${endpoint}`, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              ...options.headers,
            },
          });

          const data = await response.json();

          return {
            success: response.ok,
            data: response.ok ? data.data || data : undefined,
            message: response.ok ? undefined : data.message || "Request failed",
            status: response.status,
          };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : "Network error",
            status: 0,
          };
        }
      }
    }
  );
});
