const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8080";

export default serverUrl.replace(/\/+$/, "");